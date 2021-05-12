import AWS = require("aws-sdk");
import { AttendeeJoinType, AttendeeState, AttendeeType, MeetingDetailsDao } from "./ddb/meeting-dao";
import { SpecialistCallStatus, SpecialistProfile, SpecialistProfileDao } from "./ddb/specialist-profile-dao";
const SNS = new AWS.SNS({ apiVersion: "2010-03-31" });
const SES = new AWS.SES({ region: 'ca-central-1' });
const db = new AWS.DynamoDB.DocumentClient({ region: 'ca-central-1' });
const chime = new AWS.Chime({ region: 'us-east-1', endpoint: 'service.chime.aws.amazon.com' });

const JOIN_PHONE_NUMBER = process.env.JOIN_PHONE_NUMBER || "";
const CALL_URL = process.env.CALL_URL || "";

const { v4: uuid } = require('uuid');

// Sned text message to specialist
const sendSMS = (meetingId: string, specialist: SpecialistProfile) => {
  const { phone_number } = specialist;

  const params = {
    Message: constructMessage(meetingId, specialist),
    PhoneNumber: phone_number,
  };

  return SNS.publish(params).promise();
};

// Sned email to specialist
const sendSES = (meetingId: string, specialist: SpecialistProfile) => {
  const { email } = specialist;
  const message = constructMessage(meetingId, specialist);

  const paramSES = {
    // Production access need to be activated, Sandbox mode requres ToAddresses to be verified 
    // https://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html
    Destination: { ToAddresses: [email] },
    Message: {
        Body: {
            Html: {
                Charset: 'UTF-8',
                Data: `<html><body><h3>This is the request detail:</h3>
                       <p>${message}</p></body></html>`
            },
        },
        Subject: {
            Charset: 'UTF-8',
            Data: 'STARS: Emergency Assistence Meeting Request'
        }
    },
    Source: process.env.SES_FROM_ADDRESS!
};

  console.log("Sending email: " + JSON.stringify(paramSES));
  return SES.sendEmail(paramSES).promise();
};

function constructMessage(meetingId: string, {
  phone_number,
  first_name,
  last_name,
}: SpecialistProfile){
  const phoneB64 = Buffer.from(phone_number).toString("base64");
  const meetingB64 = Buffer.from(meetingId).toString("base64");
  const message =  `STARS: ${first_name} ${last_name}, you have been requested to assist in an emergency.
    Please visit ${CALL_URL}?p=${phoneB64}&m=${meetingB64}
    or call ${JOIN_PHONE_NUMBER} to join the meeting.`

  return message;
}

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
    
    const {phone_number, email, first_name, last_name, organization} = specialist;
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

    const specialistProfileDao = new SpecialistProfileDao(db);

    // Set the user page flag - this flag is cleared when the meeting ends.
    specialist.call_status = SpecialistCallStatus.PAGED;

    try {
      await dao.saveMeetingDetails(meeting);
      await specialistProfileDao.saveSpecialistProfile(specialist);
  
      await sendSMS(meeting.external_meeting_id, specialist);
      console.log("Successfully notified the specialist via text message")
      await sendSES(meeting.external_meeting_id, specialist);
      console.log("Successfully notified the specialist via email")

      return true;

    } catch(e) {
      console.log("Error notifying the specialist")
      console.log(e);
      return false;
    }
};
