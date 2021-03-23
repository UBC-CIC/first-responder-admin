import AWS = require('aws-sdk');
import { AttendeeType, MeetingDetails, MeetingDetailsDao } from './ddb/meeting-dao';
const { v4: uuidv4 } = require('uuid');

// The AWS Chime client is only available in select regions
const chime = new AWS.Chime({ region: 'ca-central-1', endpoint: 'service.chime.aws.amazon.com' });
const db = new AWS.DynamoDB.DocumentClient({ region: 'ca-central-1' });

// Handler for data initiated calls to create and join Chime meeting
//
export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log("Chime SDK CREATE invoked with call details:" + JSON.stringify(event));

    const {
        meetingId,
        phoneNumber,
      } = event.arguments;

      const dao = new MeetingDetailsDao(db);

      console.log("Unique Meeting ID: ", meetingId);
      let meetingDetails = await dao.getMeetingWithMeetingId(meetingId);
      let joinInfo: any;

      if (!meetingDetails) {
          // Create meeting and attendee
          // 
          joinInfo = await newCall(meetingId, phoneNumber, dao)

      } else {
          // Add attendee to the existing call
          //   
          joinInfo = await joinExistingCall(meetingDetails, event, dao)
      }
    
      return joinInfo;
};

// Handles a new data initiated call by creating a new meeting with Chime and registering the meeting in DynamoDB.
//
async function newCall(callId: string, phoneNumber: string, dao: MeetingDetailsDao) {

    const externalMeetingId = await dao.generateExternalMeetingId();

    const meetingResponse = await chime.createMeeting({
        ExternalMeetingId: externalMeetingId,
        ClientRequestToken: uuidv4(),
        MediaRegion: 'ca-central-1', // Meetings should always be held in this region for data privacy restrictions
    }).promise();
    console.log("meeting response:" + JSON.stringify(meetingResponse, null, 2));

    const meeting: AWS.Chime.Meeting = meetingResponse.Meeting!;
    const request: AWS.Chime.CreateAttendeeRequest = {
        MeetingId: meeting.MeetingId!,
        ExternalUserId: uuidv4(),
    };
    const attendeeResponse = await chime.createAttendee(request).promise();
    console.log("attendee details:" + JSON.stringify(attendeeResponse, null, 2));

    // Registers the meeting in DDB
    //
    await dao.createNewMeeting(meeting.MeetingId!, phoneNumber, attendeeResponse.Attendee!.AttendeeId!, callId, externalMeetingId, AttendeeType.DATA);

    const joinInfo = {
        id: callId,
        Meeting: meeting,
        Attendee: attendeeResponse.Attendee,
      };
    
      return joinInfo;
}

// Handles a new attendee joins an existing call by creating an attendee with Chime and add the attendee to the meeting in DynamoDB.
// 
async function joinExistingCall(meetingDetails: MeetingDetails , event: any, dao: MeetingDetailsDao) {
    const {
        externalAttendeeId,
        phoneNumber,
      } = event.arguments;

    console.info("Adding new attendee to existing meeting");
    const attendeeInfo = await chime.createAttendee({
        MeetingId: meetingDetails.meeting_id,
        ExternalUserId: externalAttendeeId,
    })
    .promise();

    // Registers the new attendee in DDB
    //
    await dao.addAttendee(meetingDetails, externalAttendeeId, phoneNumber)
    
      const joinInfo = {
        id: phoneNumber,
        Meeting: meetingDetails.meeting_id,
        Attendee: attendeeInfo.Attendee,
      };

    return joinInfo;
}