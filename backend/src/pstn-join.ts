import AWS = require('aws-sdk');
import { MeetingDetailsDao } from './ddb/meeting-dao';
const { v4: uuidv4 } = require('uuid');

// The AWS Chime client is only available in select regions
const chime = new AWS.Chime({ region: 'us-east-1', endpoint: 'service.chime.aws.amazon.com' });
const db = new AWS.DynamoDB.DocumentClient({ region: 'ca-central-1' });
const TABLE_NAME = process.env.TABLE_NAME || '';

// Handler for the PSTN number SIP media application that allows users to join an existing meeting 
// after entering the meeting ID.
//
export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log("PSTN JOIN invoked with call details:" + JSON.stringify(event));
    let actions: any;

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

// Handles a new incoming call by answering the call and gathering the DTMF tones.
// If the user is supposed to be part of an existing meeting, we will join them 
// automatically.
// Since the call ID is expected to be pre-filled when the user is calling, 
// we skip the traditional welcome message and go right into waiting for the user action.
//
async function newCall(event: any) {
    const fromNumber = event.CallDetails.Participants[0].From;
    const callId = event.CallDetails.Participants[0].CallId;
    const dao = new MeetingDetailsDao(db);
    const existingMeeting = await dao.getExistingMeetingWithPhoneNumber(fromNumber);
    if (existingMeeting) {
        console.log(`Existing meeting found for phone number ${fromNumber}`);

        const request: AWS.Chime.CreateAttendeeRequest = {
            MeetingId: existingMeeting.meeting_id,
            ExternalUserId: uuidv4(),
        };
        const attendeeResponse = await chime.createAttendee(request).promise();
        console.log("attendee details:" + JSON.stringify(attendeeResponse, null, 2));

        // Update the meeting in DDB
        existingMeeting.attendees.push({
            "attendee_id": attendeeResponse.Attendee!.AttendeeId!,
            "phone_number": fromNumber,
        });
        await dao.saveMeetingDetails(existingMeeting);

        // Return join meeting action to bridge user to meeting
        //
        joinChimeMeetingAction.Parameters.CallID = callId;
        joinChimeMeetingAction.Parameters.JoinToken = attendeeResponse.Attendee!.JoinToken!;
        console.log(`Joining with external meeting ID ${existingMeeting.meeting_id} ...`);
        console.log(joinChimeMeetingAction);
        return [joinChimeMeetingAction];
    } else {
        console.log(`No existing meeting found for phone number ${fromNumber}, prompting user for meeting ID.`);
        playAudioAndGetDigitsAction.Parameters.CallID = callId;
        return [playAudioAndGetDigitsAction];
    }
}

// We will ignore special inputs for now (like muting/unmuting).
// 
async function receivedDigits(event: any) {
    console.log("receivedDigits - no actions taken");
    return [];
}

// Action successful handler
async function actionSuccessful(event: any) {
    const fromNumber = event.CallDetails.Participants[0].From;
    const callId = event.CallDetails.Participants[0].CallId;
    console.log(`actionSuccessful for phone number ${fromNumber}`);
    
    switch (event.ActionData.Type) {
        case "PlayAudioAndGetDigits":
            // Last action was PlayAudioAndGetDigits
            const externalMeetingId = event.ActionData.ReceivedDigits;
            console.log(`Attempting to join an existing meeting - received: ${externalMeetingId}`);

            const dao = new MeetingDetailsDao(db);
            const existingMeeting = await dao.getMeetingWithExternalMeetingId(externalMeetingId);
            if (!existingMeeting) {
                // The meeting does not exist
                console.error(`The meeting with ID ${externalMeetingId} does not exist!`);
                playAudioAndGetDigitsAction.Parameters.CallID = callId;
                return [playAudioAndGetDigitsAction];
            }

            // Get/create attendee
            const attendee = await chime.createAttendee({ MeetingId: existingMeeting.meeting_id, ExternalUserId: uuidv4() }).promise();
            console.log("attendee details:" + JSON.stringify(attendee, null, 2));

            // Updates the meeting in DDB
            //
            existingMeeting.attendees.push({
                "attendee_id": attendee.Attendee?.AttendeeId!,
                "phone_number": fromNumber
            });
            await dao.saveMeetingDetails(existingMeeting);

            // Return join meeting action to bridge user to meeting
            joinChimeMeetingAction.Parameters.CallID = callId;
            joinChimeMeetingAction.Parameters.JoinToken = attendee.Attendee!.JoinToken!;
            return [joinChimeMeetingAction];

        case "JoinChimeMeeting":
            // Last action was JoinChimeMeeting
            console.log("Join meeting successful");

            // Play meeting joined and register for dtmf
            playAudioAction.Parameters.AudioSource.Key = "pstn-connecting.wav";
            return [playAudioAction];

            // See https://github.com/aws-samples/chime-sipmediaapplication-samples for additional
            // examples on how to allow users to dynamically mute/unmute.

        case "PlayAudio":
            return [];
            
        case "ReceiveDigits":
            return [];

        default:
            playAudioAndGetDigitsAction.Parameters.CallID = callId;
            return [playAudioAndGetDigitsAction];
    }
}

const hangupAction = {
    "Type": "Hangup",
    "Parameters": {
        "SipResponseCode": "0"
    }
};

const playAudioAndGetDigitsAction = {
    "Type": "PlayAudioAndGetDigits",
    "Parameters": {
        "CallID": "",
        "MinNumberOfDigits": 8,
        "MaxNumberOfDigits": 8,
        "Repeat": 3,
        "InBetweenDigitsDurationInMilliseconds": 10000,
        "RepeatDurationInMilliseconds": 10000,
        "TerminatorDigits": ["#"],
        "AudioSource": {
            "Type": "S3",
            "BucketName": "first-responder-audio-assets",
            "Key": "pstn-meeting-pin.wav"
        },
        "FailureAudioSource": {
            "Type": "S3",
            "BucketName": "first-responder-audio-assets",
            "Key": "pstn-meeting-pin.wav"
        }
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
