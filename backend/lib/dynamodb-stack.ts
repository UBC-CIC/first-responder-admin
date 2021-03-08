import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { BillingMode, ProjectionType } from "@aws-cdk/aws-dynamodb";
import cdk = require('@aws-cdk/core');

// The STARS DDB stack should be created in ca-central-1 for data and privacy reasons. 
//
export class StarsDynamoStack extends cdk.Stack {
    private static USER_PROFILE_TABLE_ID = "UserProfileDynamoTable"
    public static USER_PROFILE_TABLE_NAME = "user-profile"
    private static USER_STATUS_GLOBAL_INDEX_NAME = "userStatusGsi"

    private static MEETING_DETAIL_TABLE_ID = "MeetingDetailDynamoTable"
    public static MEETING_DETAIL_TABLE_NAME = "meeting-detail"
    private static MEETING_STATUS_GLOBAL_INDEX_NAME = "meetingStatusGsi"

    constructor(app: cdk.App, id: string) {
        super(app, id);
    
        const userProfileTable = new dynamodb.Table(this, StarsDynamoStack.USER_PROFILE_TABLE_ID, {
            tableName: StarsDynamoStack.USER_PROFILE_TABLE_NAME,
            partitionKey: {
                name: 'email',
                type: dynamodb.AttributeType.STRING
              },
            billingMode: BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true
        });
        const userStatusGsiProps: dynamodb.GlobalSecondaryIndexProps = {
            indexName: StarsDynamoStack.USER_STATUS_GLOBAL_INDEX_NAME,
            partitionKey: {
              name: 'status',
              type: dynamodb.AttributeType.STRING
            },
            sortKey: {
              name: 'email',
              type: dynamodb.AttributeType.STRING
            },
            projectionType: dynamodb.ProjectionType.ALL
        };
        userProfileTable.addGlobalSecondaryIndex(userStatusGsiProps);


        const meetingDetailsTable = new dynamodb.Table(this, StarsDynamoStack.MEETING_DETAIL_TABLE_ID, {
            tableName: StarsDynamoStack.MEETING_DETAIL_TABLE_NAME,
            partitionKey: {
                name: 'meeting_id',
                type: dynamodb.AttributeType.STRING
              },
            sortKey: {
                name: 'create_date_time',
                type: dynamodb.AttributeType.STRING
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true
        });
        const meetingStatusGsiProps: dynamodb.GlobalSecondaryIndexProps = {
            indexName: StarsDynamoStack.MEETING_STATUS_GLOBAL_INDEX_NAME,
            partitionKey: {
              name: 'status',
              type: dynamodb.AttributeType.STRING
            },
            sortKey: {
              name: 'meeting_id',
              type: dynamodb.AttributeType.STRING
            },
            projectionType: dynamodb.ProjectionType.ALL
        };
        meetingDetailsTable.addGlobalSecondaryIndex(meetingStatusGsiProps);

    }
}