import { DynamoDBStreamEvent } from './meeting-detail/type/dynamodb-type';
import { publishCreateMeeting, publishUpdateMeeting } from './meeting-detail/publish-meetingdetail-updates';

// Lambda triggered by DynamoDB stream of meeting-detail table
// assuming DynamoDB stream is enabled and its trigger is configured with batch size 1,
// so that the stream event would trigger this lambda every time data changes, which means Records length is always 1.
export const handler = async (event: DynamoDBStreamEvent) => {
    console.log('DynamoDBStreamEvent', JSON.stringify(event, null, ' '));

    if (!event || !event.Records || event.Records.length < 1 || !event.Records[0].eventSourceARN) {
        console.log('[ERROR] empty DDB stream event');
        return {
            statusCode: 500,
            body: 'DynamoDBStreamEvent is null or empty.'
        };
    }

    const record = event.Records[0];
    const oldImage = record.dynamodb?.OldImage;
    const newImage = record.dynamodb?.NewImage;
    const eventSourceARN = record.eventSourceARN;

    if (newImage && oldImage && eventSourceARN) {
        // Update events are published to AppSync
        console.log("DynamoDBStreamEvent is an update event.");
        return await publishUpdateMeeting(newImage);
    }

    if (newImage && eventSourceARN) {
        // Creation events are published to AppSync
        if (eventSourceARN.includes('meeting-detail')) {
            console.log("DynamoDBStreamEvent is an create event.");
            return await publishCreateMeeting(newImage);
        } else {
            return {
                statusCode: 500,
                body: 'DynamoDBStreamEvent came from unknown Event Source'
            };
        }
    } else { 
        return {
            statusCode: 200, 
            body: 'DynamoDBStreamEvent was for a deleted record'
        };
    }
};