import AWS = require('aws-sdk');
import { join } from 'path';

const dynamodb = new AWS.DynamoDB({ region: process.env.AWS_REGION });
const chime = new AWS.Chime({ region: 'us-east-1', endpoint: 'service.chime.aws.amazon.com' });
const db = new AWS.DynamoDB.DocumentClient();

const { v4: uuidv4 } = require('uuid');
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
    DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log("Lambda is invoked with calldetails:" + JSON.stringify(event));
    let actions;

    switch (event.InvocationEventType) {
        case "NEW_INBOUND_CALL":
            console.log("INBOUND");
            // New inbound call
            actions = await newCall(event);
            break;

        case "DIGITS_RECEIVED":
            console.log("RECEIVED DIGITS ACTIONS");
            // In-Call DTMF (digtis) detected
            actions = await receivedDigits(event);
            break;

        case "ACTION_SUCCESSFUL":
            // Action from the previous invocation response 
            // or a action requiring callback was successful
            console.log("SUCCESS ACTION");
            actions = await actionSuccessful(event);
            break;

        case "HANGUP":
            // Hangup received
            console.log("HANGUP ACTION");
            if (event.CallDetails.Participants[0].Status === "Disconnected") {
                console.log("DISCONNECTED");
            }
            actions = [];
            break;

        default:
            // Action unsuccessful or unknown event recieved
            console.log("FAILED ACTION");
            actions = [hangupAction];
    }

    const response = {
        "SchemaVersion": "1.0",
        "Actions": actions
    };

    console.log("Sending response:" + JSON.stringify(response));

    callback(null, response);
};

// New call handler
async function newCall(event: any) {
    console.log("NEW CALL");
    const fromNumber = event.CallDetails.Participants[0].From;
    const callId = event.CallDetails.Participants[0].CallId;

    // Create a new Chime meeting
    const meetingResponse = await chime.createMeeting({
        ExternalMeetingId: uuidv4(),
        ClientRequestToken: uuidv4(),
        MediaRegion: 'us-west-2' // Specify the region in which to create the meeting.
    }).promise();
    console.log("meeting response:" + JSON.stringify(meetingResponse, null, 2));

    const meeting: AWS.Chime.Meeting = meetingResponse.Meeting!;
    const request: AWS.Chime.CreateAttendeeRequest = {
        MeetingId: meeting.MeetingId!,
        ExternalUserId: uuidv4() // Link the attendee to an identity managed by your application.
    };
    const attendeeResponse = await chime.createAttendee(request).promise();
    console.log("attendee details:" + JSON.stringify(attendeeResponse, null, 2));

    const item: Object = {
        "itemId": meeting.MeetingId!,
        "attendeeId": attendeeResponse.Attendee!.AttendeeId,
        "fromNumber": fromNumber,
        "callId": callId
    };

    // Write meeting to DDB
    const params = {
        TableName: TABLE_NAME,
        Item: item
    };

    try {
        await db.put(params).promise();
    } catch (dbError) {
        const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
            DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
        return { statusCode: 500, body: errorResponse };
    }

    // Return join meeting action to bridge user to meeting
    joinChimeMeetingAction.Parameters.CallID = meeting.MeetingId!;
    joinChimeMeetingAction.Parameters.JoinToken = attendeeResponse.Attendee!.JoinToken!;
    console.log("Join ...");
    console.log(joinChimeMeetingAction);
    return [joinChimeMeetingAction];
}

// New call handler
async function receivedDigits(event: any) {
    console.log("receivedDigits");
}

// Action successful handler
async function actionSuccessful(event: any) {
    console.log("ACTION_SUCCESSFUL");
    
    const fromNumber = event.CallDetails.Participants[0].From;
    const callId = event.CallDetails.Participants[0].CallId;
    
    switch (event.ActionData.Type) {
        case "PlayAudioAndGetDigits":
            // Last action was PlayAudioAndGetDigits
            console.log("Join meeting using Meeting id");
            
            const meetingId = event.ActionData.ReceivedDigits;

            // Get/create meeting
            const meeting = await chime.createMeeting({ ClientRequestToken: meetingId, MediaRegion: 'us-east-1' }).promise();
            console.log("meeting details:" + JSON.stringify(meeting, null, 2));

            // Get/create attendee
            const attendee = await chime.createAttendee({ MeetingId: meeting.Meeting!.MeetingId!, ExternalUserId: fromNumber }).promise();
            console.log("attendee details:" + JSON.stringify(attendee, null, 2));

            // await updateAttendee(event, meeting.Meeting.MeetingId, attendee.Attendee.AttendeeId);

            // Return join meeting action to bridge user to meeting
            joinChimeMeetingAction.Parameters.CallID = meeting.Meeting!.MeetingId!;
            joinChimeMeetingAction.Parameters.JoinToken = attendee.Attendee!.JoinToken!;
            return [joinChimeMeetingAction];

        case "JoinChimeMeeting":
            // Last action was JoinChimeMeeting
            console.log("Join meeting successful");

            // Play meeting joined and register for dtmf
            playAudioAction.Parameters.AudioSource.Key = "meeting_joined.wav";
            return [receiveDigitsAction, playAudioAction];

        // case "ModifyChimeMeetingAttendees":
        //     switch (event.ActionData.Parameters.Operation) {
        //         case "Mute":
        //             var a = await getAttendeeInfo(fromNumber, callId);
                    
        //             if (event.ActionData.Parameters.AttendeeList.includes(a![0].attendeeId.S)) {
        //                 // Mute
        //                 playAudioAction.Parameters.AudioSource.Key = "muted.wav";
        //             }
        //             else {
        //                 // Mute All
        //                 playAudioAction.Parameters.AudioSource.Key = "mute_all.wav";
        //             }
        //             return [playAudioAction];

        //         case "Unmute":
        //             var a = await getAttendeeInfo(fromNumber, callId);
        //             if (event.ActionData.Parameters.AttendeeList.includes(a[0].attendeeId.S)) {
        //                 // Unmute
        //                 playAudioAction.Parameters.AudioSource.Key = "unmuted.wav";
        //             }
        //             else {
        //                 // Unmute All
        //                 playAudioAction.Parameters.AudioSource.Key = "unmute_all.wav";
        //             }

        //             return [playAudioAction];
        //     }
            
        case "PlayAudio":
            return [];
            
        case "ReceiveDigits":
            return [];

        default:
            return [playAudioAndGetDigitsAction];
    }
}

const pauseAction = {
    "Type": "Pause",
    "Parameters": {
        "DurationInMilliseconds": "1000"
    }
};

const hangupAction = {
    "Type": "Hangup",
    "Parameters": {
        "SipResponseCode": "0"
    }
};

const playAudioAction = {
    "Type": "PlayAudio",
    "Parameters": {
        "ParticipantTag": "LEG-A",
        "AudioSource": {
            "Type": "S3",
            "BucketName": "source-us-east-1-178796772275",
            "Key": ""
        }
    }
};

const playAudioAndGetDigitsAction = {
    "Type": "PlayAudioAndGetDigits",
    "Parameters": {
        "MinNumberOfDigits": 5,
        "MaxNumberOfDigits": 5,
        "Repeat": 3,
        "InBetweenDigitsDurationInMilliseconds": 1000,
        "RepeatDurationInMilliseconds": 5000,
        "TerminatorDigits": ["#"],
        "AudioSource": {
            "Type": "S3",
            "BucketName": "source-us-east-1-178796772275",
            "Key": "meeting_pin.wav"
        },
        "FailureAudioSource": {
            "Type": "S3",
            "BucketName": "source-us-east-1-178796772275",
            "Key": "meeting_pin.wav"
        }
    }
};

const joinChimeMeetingAction = {
    "Type": "JoinChimeMeeting",
    "Parameters": {
        "JoinToken": "",
        "CallID": ""
    }
};

const receiveDigitsAction = {
    "Type": "ReceiveDigits",
    "Parameters": {
        "InputDigitsRegex": "^\\*\\d{1}$",
        "InBetweenDigitsDurationInMilliseconds": 1000,
        "FlushDigitsDurationInMilliseconds": 10000
    }
};

const muteAttendeesAction = {
    "Type": "ModifyChimeMeetingAttendees",
    "Parameters": {
        "ParticipantTag": "LEG-B",
        "Operation": "Mute",
        "MeetingId": "",
        "AttendeeList": ""
    }
};

const unmuteAttendeesAction = {
    "Type": "ModifyChimeMeetingAttendees",
    "Parameters": {
        "ParticipantTag": "LEG-B",
        "Operation": "Unmute",
        "MeetingId": "",
        "AttendeeList": ""
    }
};
