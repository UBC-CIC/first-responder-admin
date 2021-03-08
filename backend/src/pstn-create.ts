import AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// The AWS Chime client is only available in select regions
const chime = new AWS.Chime({ region: 'us-east-1', endpoint: 'service.chime.aws.amazon.com' });
const db = new AWS.DynamoDB.DocumentClient({ region: 'ca-central-1' });
const TABLE_NAME = process.env.TABLE_NAME || '';

// Handler for the PSTN number SIP media application that automatically creates a new meeting upon dial-in.
//
export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log("PSTN CREATE invoked with call details:" + JSON.stringify(event));
    let actions;

    switch (event.InvocationEventType) {
        case "NEW_INBOUND_CALL":
            console.log("[NEW_INBOUND_CALL] Call received...");
            // New inbound call indicates that we should create a new meeting
            actions = await newCall(event);
            break;

        case "DIGITS_RECEIVED":
            console.log("[DIGITS_RECEIVED] Digits received...");
            // In-Call DTMF (digtis) detected
            actions = await receivedDigits(event);
            break;

        case "ACTION_SUCCESSFUL":
            // Action from the previous invocation response 
            // or a action requiring callback was successful
            console.log("[ACTION_SUCCESSFUL]");
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

// Handles a new incoming call by creating a new meeting with Chime and registering the meeting in DynamoDB.
//
async function newCall(event: any) {
    const fromNumber = event.CallDetails.Participants[0].From;
    const callId = event.CallDetails.Participants[0].CallId;

    // Create a new Chime meeting
    const meetingResponse = await chime.createMeeting({
        ExternalMeetingId: uuidv4(),
        ClientRequestToken: uuidv4(),
        MediaRegion: 'ca-central-1' // Specify the region in which to create the meeting.
    }).promise();
    console.log("meeting response:" + JSON.stringify(meetingResponse, null, 2));

    const meeting: AWS.Chime.Meeting = meetingResponse.Meeting!;
    const request: AWS.Chime.CreateAttendeeRequest = {
        MeetingId: meeting.MeetingId!,
        ExternalUserId: uuidv4() // Link the attendee to an identity managed by your application.
    };
    const attendeeResponse = await chime.createAttendee(request).promise();
    console.log("attendee details:" + JSON.stringify(attendeeResponse, null, 2));

    // Registers the meeting in DDB
    //
    const meetingObj: Object = {
        "meeting_id": meeting.MeetingId!,
        "attendees": [fromNumber],
        "attendee_ids": [attendeeResponse.Attendee!.AttendeeId],
        "create_date_time": new Date().toISOString(),
        "call_id": callId
    };
    const params = {
        TableName: TABLE_NAME,
        Item: meetingObj
    };
    await db.put(params).promise();

    // Return join meeting action to bridge user to meeting
    //
    joinChimeMeetingAction.Parameters.CallID = meeting.MeetingId!;
    joinChimeMeetingAction.Parameters.JoinToken = attendeeResponse.Attendee!.JoinToken!;
    console.log("Join ...");
    console.log(joinChimeMeetingAction);
    return [joinChimeMeetingAction];
}

// This PSTN number creates a new meeting directly and should not require any additional user input
// 
async function receivedDigits(event: any) {
    console.log("receivedDigits - no actions taken");
}

// Action successful handler
async function actionSuccessful(event: any) {
    const fromNumber = event.CallDetails.Participants[0].From;
    const callId = event.CallDetails.Participants[0].CallId;
    console.log(`actionSuccessful for phone number ${fromNumber}`);
    
    switch (event.ActionData.Type) {
        case "JoinChimeMeeting":
            // Last action was JoinChimeMeeting
            console.log("Join meeting successful");

            // Play meeting joined and register for dtmf
            playAudioAction.Parameters.AudioSource.Key = "pstn-create-welcome.wav";
            return [playAudioAction];

            // See https://github.com/aws-samples/chime-sipmediaapplication-samples for additional
            // examples on how to allow users to dynamically mute/unmute.

        case "PlayAudio":
            return [];
            
        case "ReceiveDigits":
            return [];

        default:
            console.log(`Received unknown action ${event.ActionData.Type}`);
            return [];
    }
}

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
            "BucketName": "first-responder-audio-assets",
            "Key": ""
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
