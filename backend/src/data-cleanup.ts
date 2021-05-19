import AWS = require('aws-sdk');
import { AttendeeType, MeetingDetailsDao } from './ddb/meeting-dao';
import { SpecialistCallStatus, SpecialistProfileDao } from './ddb/specialist-profile-dao';
// The AWS Chime client is only available in select regions
const chime = new AWS.Chime({
    region: "us-east-1",
    endpoint: "service.chime.aws.amazon.com",
  });

const db = new AWS.DynamoDB.DocumentClient({ region: 'ca-central-1' });

/**
 * Deletes a meeting from DynamoDB when Chime deletes the meeting.
 */
export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log("Invoked with details:" + JSON.stringify(event));
    const meetingId = event.arguments.input.meeting_id;

    const meetingResponse = await chime.deleteMeeting({
        MeetingId: meetingId
      }).promise();
      console.log("Deleting meeting id - " + meetingId + "response - " + meetingResponse);

    const dao = new MeetingDetailsDao(db);
    await dao.endMeeting(meetingId);
    console.log(`Meeting ended...`);
    updateSpecialistStatusIfApplicable(dao, meetingId);

    return true;
};

const updateSpecialistStatusIfApplicable = async (dao: MeetingDetailsDao, meetingId: string, attendeeId: string | null = null): Promise<any> => {
    console.log(`Cleaning up the status of any paged specialists for meeting ${meetingId}`);
    const meeting = await dao.getMeetingWithMeetingId(meetingId);
    for (let attendee of meeting.attendees) {
        if (attendee.attendee_type === AttendeeType.SPECIALIST) {
            if (attendeeId === null || attendeeId === attendee.attendee_id) {
                console.log(`Found specialist to cleanup: ${attendee.phone_number}`);
                const specialistProfileDao = new SpecialistProfileDao(db);
                await specialistProfileDao.updateSpecialistCallStatus(attendee.phone_number, SpecialistCallStatus.NOT_IN_CALL);
            }
        }
    }
}
