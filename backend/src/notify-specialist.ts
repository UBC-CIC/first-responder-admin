import AWS = require("aws-sdk");
import { AttendeeJoinType, AttendeeState, AttendeeType, MeetingDetailsDao } from "./ddb/meeting-dao";
import { SpecialistProfile } from "./ddb/specialist-profile-dao";
const SNS = new AWS.SNS({ apiVersion: "2010-03-31" });
const db = new AWS.DynamoDB.DocumentClient({ region: 'ca-central-1' });
const chime = new AWS.Chime({ region: 'us-east-1', endpoint: 'service.chime.aws.amazon.com' });

const JOIN_PHONE_NUMBER = process.env.JOIN_PHONE_NUMBER || "";
const CALL_URL = process.env.CALL_URL || "";

const { v4: uuid } = require('uuid');

const sendSMS = (meetingId: string, {
  phone_number,
  first_name,
  last_name,
}: SpecialistProfile) => {
  const phoneB64 = Buffer.from(phone_number).toString("base64");
  const meetingB64 = Buffer.from(meetingId).toString("base64");
  const params = {
    Message: `STARS: ${first_name} ${last_name}, you have been requested to assist in an emergency. 
    Please visit ${CALL_URL}?p=${phoneB64}&m=${meetingB64}
    or call ${JOIN_PHONE_NUMBER} to join the meeting.`,
    PhoneNumber: phone_number,
  };

  return SNS.publish(params).promise();
};

export const handler = async (
  event: any = {},
  context: any,
  callback: any
): Promise<any> => {
    console.log("event: ", event);
    
    const { specialist, external_meeting_id }: { specialist: SpecialistProfile, external_meeting_id: string } = event.arguments.input;
    const dao = new MeetingDetailsDao(db);
    const meeting = await dao.getMeetingWithExternalMeetingId(external_meeting_id);
    console.log("Specialist: ", specialist);
    console.log("external_meeting_id: ", external_meeting_id);
    console.log("Meeting: ", meeting);
    
    if (!meeting) return false;
    console.log("Found meeting: ", meeting);
    
    const {phone_number, first_name, last_name, organization} = specialist;
    const request: AWS.Chime.CreateAttendeeRequest = {
        MeetingId: meeting.meeting_id,
        ExternalUserId: uuid(),
    };
    const attendeeResponse = await chime.createAttendee(request).promise();
    if (!attendeeResponse.Attendee?.AttendeeId) return false;
    meeting.attendees.push({
        phone_number,
        "attendee_id": attendeeResponse.Attendee?.AttendeeId,
        "attendee_type": AttendeeType.SPECIALIST,
        "attendee_join_type": AttendeeJoinType.PSTN,
        "attendee_state": AttendeeState.PAGED,
        first_name,
        last_name,
        organization
    });

    try {
      await dao.saveMeetingDetails(meeting);
  
      await sendSMS(meeting.external_meeting_id, specialist);
      return true;

    } catch(e) {
      return false;
    }
};
