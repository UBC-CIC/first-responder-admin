import { DynamoDBStreamEvent } from './type/dynamodb-type';
import { publishMeetingDetail } from './meeting-detail/publish-meetingdetail-updates';

// Lambda triggered by DynamoDB stream of meeting-detail table
// assuming DynamoDB stream is enabled and its trigger is configured with batch size 1,
// so that the stream event would trigger this lambda every time data changes, which means Records length is always 1.
exports.handler = async (event: DynamoDBStreamEvent) => {
    console.log('DynamoDBStreamEvent', JSON.stringify(event, null, ' '));

    if (!event || !event.Records || event.Records.length < 1 || !event.Records[0].eventSourceARN) {
        console.log('[ERROR] empty DDB stream event');
        return {
            statusCode: 500,
            body: 'DynamoDBStreamEvent is null or empty.'
        };
    }

    const record = event.Records[0];
    const newImage = record.dynamodb?.NewImage;
    const eventSourceARN = record.eventSourceARN;

    if (newImage && eventSourceARN) {
        if (eventSourceARN.includes('meeting-detail')) {
            return await publishMeetingDetail(newImage);
        } else {
            return {
                statusCode: 500,
                body: 'DynamoDBStreamEvent came from unknown Event Source'
            };
        }
    } else { 
        return {
            statusCode: 200, 
            ody: 'record deleted'
        };
    }
}