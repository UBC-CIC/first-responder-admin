import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { BillingMode, StreamViewType } from "@aws-cdk/aws-dynamodb";
import { CfnOutput } from "@aws-cdk/core";
import cdk = require('@aws-cdk/core');

// The DynamoDB stack should be created in ca-central-1 for data and privacy reasons. 
//
export class FirstResponderAdminDynamoStack extends cdk.Stack {
    private static SERVICE_DESK_PROFILE_TABLE_ID = "ServiceDeskProfileDynamoTable"
    public static SERVICE_DESK_TABLE_NAME = "service-desk-profile"

    private static FIRST_RESPONDER_PROFILE_TABLE_ID = "FirstResponderProfileDynamoTable"
    public static FIRST_RESPONDER_TABLE_NAME = "first-responder-profile"

    private static SPECIALIST_PROFILE_TABLE_ID = "SpecialistProfileDynamoTable"
    public static SPECIALIST_PROFILE_TABLE_NAME = "specialist-profile"
    public static SPECIALIST_USER_STATUS_GLOBAL_INDEX_NAME = "userStatusGsi"

    private static MEETING_DETAIL_TABLE_ID = "MeetingDetailDynamoTable"
    public static MEETING_DETAIL_TABLE_NAME = "meeting-detail"

    public static MEETING_DATA_TABLE_NAME = "meeting-data"
    private static MEETING_DATA_TABLE_ID = "MeetingDataDynamoTable"

    public static MEETING_STATUS_GLOBAL_INDEX_NAME = "meetingStatusGsi"

    constructor(app: cdk.App, id: string) {
        super(app, id, {
          env: {
            region: 'ca-central-1'
          },
        });
    
        const serviceDeskProfileTable = new dynamodb.Table(this, FirstResponderAdminDynamoStack.SERVICE_DESK_PROFILE_TABLE_ID, {
            tableName: FirstResponderAdminDynamoStack.SERVICE_DESK_TABLE_NAME,
            partitionKey: {
                name: 'username',
                type: dynamodb.AttributeType.STRING
              },
            billingMode: BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true
        });

        const firstResponderProfileTable = new dynamodb.Table(this, FirstResponderAdminDynamoStack.FIRST_RESPONDER_PROFILE_TABLE_ID, {
            tableName: FirstResponderAdminDynamoStack.FIRST_RESPONDER_TABLE_NAME,
            partitionKey: {
                name: 'phone_number',
                type: dynamodb.AttributeType.STRING
              },
            billingMode: BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true
        });

        const specialistProfileTable = new dynamodb.Table(this, FirstResponderAdminDynamoStack.SPECIALIST_PROFILE_TABLE_ID, {
            tableName: FirstResponderAdminDynamoStack.SPECIALIST_PROFILE_TABLE_NAME,
            partitionKey: {
                name: 'phone_number',
                type: dynamodb.AttributeType.STRING
              },
            billingMode: BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true
        });
        const specialistUserStatusGsiProps: dynamodb.GlobalSecondaryIndexProps = {
            indexName: FirstResponderAdminDynamoStack.SPECIALIST_USER_STATUS_GLOBAL_INDEX_NAME,
            partitionKey: {
              name: 'user_status',
              type: dynamodb.AttributeType.STRING
            },
            sortKey: {
              name: 'phone_number',
              type: dynamodb.AttributeType.STRING
            },
            projectionType: dynamodb.ProjectionType.ALL
        };
        specialistProfileTable.addGlobalSecondaryIndex(specialistUserStatusGsiProps);

        const meetingDetailsTable = new dynamodb.Table(this, FirstResponderAdminDynamoStack.MEETING_DETAIL_TABLE_ID, {
            tableName: FirstResponderAdminDynamoStack.MEETING_DETAIL_TABLE_NAME,
            partitionKey: {
              name: 'meeting_id',
              type: dynamodb.AttributeType.STRING
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
            stream: StreamViewType.NEW_AND_OLD_IMAGES,
        });

        const meetingDataTable = new dynamodb.Table(this, FirstResponderAdminDynamoStack.MEETING_DATA_TABLE_ID, {
          tableName: FirstResponderAdminDynamoStack.MEETING_DATA_TABLE_NAME,
          partitionKey: {
            name: 'id',
            type: dynamodb.AttributeType.STRING
          },
          billingMode: BillingMode.PAY_PER_REQUEST,
          pointInTimeRecovery: true,
      });
        const meetingStatusGsiProps: dynamodb.GlobalSecondaryIndexProps = {
            indexName: FirstResponderAdminDynamoStack.MEETING_STATUS_GLOBAL_INDEX_NAME,
            partitionKey: {
              name: 'meeting_status',
              type: dynamodb.AttributeType.STRING
            },
            sortKey: {
              name: 'create_date_time',
              type: dynamodb.AttributeType.STRING
            },
            projectionType: dynamodb.ProjectionType.ALL
        };
        meetingDetailsTable.addGlobalSecondaryIndex(meetingStatusGsiProps);

        if (meetingDetailsTable.tableStreamArn) {
          new CfnOutput(this, `MeetingDetailTableStreamArn`, {
              exportName: `MeetingDetailTableStreamArn`,
              value: meetingDetailsTable.tableStreamArn
          })
      }
      
    }
}
