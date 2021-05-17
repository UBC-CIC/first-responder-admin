import AWS = require('aws-sdk');
import { AttendeeType, MeetingDetailsDao } from './ddb/meeting-dao';
import { SpecialistCallStatus, SpecialistProfileDao } from './ddb/specialist-profile-dao';

const db = new AWS.DynamoDB.DocumentClient({ region: 'ca-central-1' });

/**
 * Deletes a meeting from DynamoDB when Chime deletes the meeting.
 */
export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log("Invoked with details:" + JSON.stringify(event));
    const eventType = event["detail"]["eventType"];
    const meetingId = event["detail"]["meetingId"];
    console.log(`Found eventType=${eventType} and meetingId=${meetingId}`);
    
    if (eventType === "chime:MeetingEnded") {
        console.log(`Found eventType meeting ended...`);
        const dao = new MeetingDetailsDao(db);
        await dao.endMeeting(meetingId);
        console.log(`Meeting ended...`);
        updateSpecialistStatusIfApplicable(dao, meetingId);
    } else if (eventType === "chime:AttendeeLeft") {
        console.log(`Found eventType attendee left...`);
        const attendeeId = event["detail"]["attendeeId"];
        console.log(`Found eventType attendee ID ${attendeeId}...`);
        const dao = new MeetingDetailsDao(db);
        await dao.attendeeLeft(meetingId, attendeeId);
        console.log(`Attendee left...`);
        updateSpecialistStatusIfApplicable(dao, meetingId, attendeeId);
    }
};

const updateSpecialistStatusIfApplicable = async (dao: MeetingDetailsDao, meetingId: string, attendeeId: string | null = null): Promise<any> => {
    console.log(`Cleaning up the status of any paged specialists for meeting ${meetingId} and attendeeId ${attendeeId}`);
    const meeting = await dao.getMeetingWithMeetingId(meetingId);
    for (let attendee of meeting.attendees) {
        if (attendee.attendee_type === AttendeeType.SPECIALIST) {
            if (!attendeeId || attendeeId === attendee.attendee_id) {
                console.log(`Found specialist to cleanup: ${attendee.phone_number}`);
                const specialistProfileDao = new SpecialistProfileDao(db);
                await specialistProfileDao.updateSpecialistCallStatus(attendee.phone_number, SpecialistCallStatus.NOT_IN_CALL);
            }
        }
    }
}
