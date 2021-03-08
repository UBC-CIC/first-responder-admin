import AWS = require('aws-sdk');

// The AWS Chime client is only available in select regions
const chime = new AWS.Chime({ region: 'us-east-1', endpoint: 'service.chime.aws.amazon.com' });
const db = new AWS.DynamoDB.DocumentClient({ region: 'ca-central-1' });
const TABLE_NAME = process.env.TABLE_NAME || '';

// Handler for the PSTN number SIP media application that allows users to join an existing meeting 
// after entering the meeting ID.
//
export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log("PSTN JOIN invoked with call details:" + JSON.stringify(event));
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

// Handles a new incoming call by answering the call and gathering the DTMF tones.
// Since the call ID is expected to be pre-filled when the user is calling, 
// we skip the traditional welcome message and go right into waiting for the user action.
//
async function newCall(event: any) {
    return [playAudioAndGetDigitsAction];
}

// We will ignore special inputs for now (like muting/unmuting).
// 
async function receivedDigits(event: any) {
    console.log("receivedDigits - no actions taken");
}

// Action successful handler
async function actionSuccessful(event: any) {
    const fromNumber = event.CallDetails.Participants[0].From;
    console.log(`actionSuccessful for phone number ${fromNumber}`);
    
    switch (event.ActionData.Type) {
        case "PlayAudioAndGetDigits":
            // Last action was PlayAudioAndGetDigits
            const meetingId = event.ActionData.ReceivedDigits;
            console.log(`Joining meeting using Meeting id - received: ${meetingId}`);

            // Get/create meeting
            const meeting = await chime.createMeeting({ ClientRequestToken: meetingId, MediaRegion: 'ca-central-1' }).promise();
            console.log("meeting details:" + JSON.stringify(meeting, null, 2));

            // Get/create attendee
            const attendee = await chime.createAttendee({ MeetingId: meeting.Meeting!.MeetingId!, ExternalUserId: fromNumber }).promise();
            console.log("attendee details:" + JSON.stringify(attendee, null, 2));

            // Updates the meeting in DDB
            //
            let existingMeeting = await db.get({
                TableName: TABLE_NAME,
                Key: {
                    "meeting_id": meeting.Meeting?.MeetingId!
                }
            }).promise();

            if (existingMeeting.Item) {
                console.log("Updating existing meeting with phone number")
                existingMeeting.Item["attendees"].push(fromNumber)
                const params = {
                    TableName: TABLE_NAME,
                    Item: existingMeeting
                };
                await db.put(params).promise();
            } else {
                console.log("Existing meeting not found!")
            }

            // Return join meeting action to bridge user to meeting
            joinChimeMeetingAction.Parameters.JoinToken = attendee.Attendee!.JoinToken!;
            return [joinChimeMeetingAction];

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
        "MinNumberOfDigits": 5,
        "MaxNumberOfDigits": 5,
        "Repeat": 3,
        "InBetweenDigitsDurationInMilliseconds": 1000,
        "RepeatDurationInMilliseconds": 5000,
        "TerminatorDigits": ["#"],
        "AudioSource": {
            "Type": "S3",
            "BucketName": process.env.BUCKET_NAME,
            "Key": "pstn-connecting.wav"
        },
        "FailureAudioSource": {
            "Type": "S3",
            "BucketName": process.env.BUCKET_NAME,
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
