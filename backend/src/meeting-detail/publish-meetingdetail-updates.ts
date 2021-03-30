import { publishMeetingDetailUpdates } from '../../../common/graphql/mutations';
import { MeetingDetail } from '../../../common/types/API';
import { initAppSyncClient } from '../utils/appsync-client';
import { ServerError, Success } from '../utils/response';

const aws = require("aws-sdk");
const gql = require('graphql-tag');
require('cross-fetch/polyfill');

/*
 * Publishes new ddb changes by calling publishMeetingDetailUpdates mutation in AppSync
 * This event does not update any DDB data, but only send notification to AppSync.
 *
 * @param ddbNewImage newImage of DynamoStreamEvent
 * @return {statusCode: 200, body: AppSyncResponse} on success
 */
export const publishMeetingDetail = async (ddbNewImage: any) => {
    console.log('New event arrived - ddbNewImage:', JSON.stringify(ddbNewImage, null, ' '));

    try {
        const meetingDetail: MeetingDetail = aws.DynamoDB.Converter.unmarshall(ddbNewImage)
        console.log('meeting detail to publish', meetingDetail);

        // Initialize AppSync GraphQL client
        const graphqlClient = initAppSyncClient()

        console.log('publishMeetingetailUpdates request', meetingDetail)
        const mutation = gql`${publishMeetingDetailUpdates}`;
        const appSyncResponse = await graphqlClient.mutate({
            mutation,
            variables: {
                meetingDetail: meetingDetail
            }
        });

        return Success(200, appSyncResponse)
    } catch (err) {
        return ServerError(500, 'publishMeetingDetail failed.', err)
    }
}