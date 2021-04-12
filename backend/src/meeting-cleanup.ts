import AWS = require('aws-sdk');
import { MeetingDetailsDao } from './ddb/meeting-dao';

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
    } else if (eventType === "chime:AttendeeLeft") {
        console.log(`Found eventType attendee left...`);
        const attendeeId = event["detail"]["attendeeId"];
        const dao = new MeetingDetailsDao(db);
        await dao.attendeeLeft(meetingId, attendeeId);
        console.log(`Attendee left...`);
    }
};
