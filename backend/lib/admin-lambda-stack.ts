import lambda = require('@aws-cdk/aws-lambda');
import cdk = require('@aws-cdk/core');
import { App, Duration, Fn } from '@aws-cdk/core';
import { Role, ServicePrincipal, PolicyDocument, PolicyStatement, Effect } from '@aws-cdk/aws-iam';
import { Schedule, Rule } from '@aws-cdk/aws-events';
import { FirstResponderAdminDynamoStack } from './admin-dynamodb-stack';
import { LambdaFunction } from "@aws-cdk/aws-events-targets";
import { Table } from '@aws-cdk/aws-dynamodb';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { StartingPosition } from '@aws-cdk/aws-lambda';
import * as path from 'path';

// The Lambda stack contains all the Lambda functions that are not directly related to PSTN. 
// These Lambda functions can be created safely in ca-central-1.
//
export class FirstResponderAdminLambdaStack extends cdk.Stack {
  constructor(app: cdk.App, id: string, graphqlUrl: string) {
    super(app, id, {
      env: {
        region: 'ca-central-1'
      },
    });

    const lambdaRole = new Role(this, 'FirstResponderBackendLambdaRole', {
        roleName: 'FirstResponderBackendLambdaRole',
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        inlinePolicies: {
            additional: new PolicyDocument({
                    statements: [
                    new PolicyStatement({
                        effect: Effect.ALLOW,
                        actions: [
                            // Chime
                            'chime:CreateMeeting',
                            'chime:DeleteMeeting',
                            'chime:CreateAttendee',
                            'chime:DeleteAttendee',
                            'chime:ListAttendees',
                            // DynamoDB
                            'dynamodb:Scan',
                            'dynamodb:GetItem',
                            'dynamodb:PutItem',
                            'dynamodb:Query',
                            'dynamodb:UpdateItem',
                            'dynamodb:DeleteItem',
                            'dynamodb:BatchWriteItem',
                            'dynamodb:BatchGetItem',
                            // IAM
                            'iam:GetRole',
                            'iam:PassRole',
                            // Lambda
                            'lambda:InvokeFunction',
                            // S3
                            's3:GetObject',
                            's3:PutObject',
                            's3:ListBucket',
                            'kms:Decrypt',
                            'kms:Encrypt',
                            'kms:GenerateDataKey',
                            // SNS
                            'sns:*',
                            // STS
                            'sts:AssumeRole',
                            // CloudWatch
                            'cloudwatch:*',
                            'logs:*',
                            // AppSync
                            "appsync:GraphQL",
                            "appsync:GetGraphqlApi",
                            "appsync:ListGraphqlApis",
                            "appsync:ListApiKeys"
                        ],
                        resources: ['*']
                    })
                ]
            }),
        },
    });

    const dataCreateFunction = new lambda.Function(this, 'dataCreateFunction', {
      functionName: "FirstResponder-Data-Create",
      code: new lambda.AssetCode('build/src'),
      handler: 'data-create.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: FirstResponderAdminDynamoStack.MEETING_DETAIL_TABLE_NAME,
        PRIMARY_KEY: 'meeting_id',
      },
      role: lambdaRole,
      memorySize: 512,
      timeout: cdk.Duration.seconds(30)
    });

    const specialistCreateFunction = new lambda.Function(this, 'specialistCreateFunction', {
        functionName: "FirstResponder-Specialist-Create",
        code: new lambda.AssetCode('build/src'),
        handler: 'specialist-status-create.handler',
        runtime: lambda.Runtime.NODEJS_10_X,
        role: lambdaRole,
        memorySize: 512,
        timeout: cdk.Duration.seconds(300),
    });

    const specialistStatusUpdateFunction = new lambda.Function(this, 'specialistStatusUpdateFunction', {
        functionName: "FirstResponder-Specialist-Status-Update",
        code: new lambda.AssetCode('build/src'),
        handler: 'specialist-status-update.handler',
        runtime: lambda.Runtime.NODEJS_10_X,
        role: lambdaRole,
        memorySize: 512,
        timeout: cdk.Duration.seconds(300), 
    });

    // Lambda triggered by meeting-details DDB stream event
    const meetingDetailDynamoDBStreamLambda = new lambda.Function(this, 'MeetingDetailDynamoDBStreamLambda', {
        functionName: 'MeetingDetailDynamoDBStreamLambda',
        runtime: lambda.Runtime.NODEJS_10_X,
        handler: 'meeting-detail-ddbstream-event-handler.handler',
        code: new lambda.AssetCode('build/src'),
        memorySize: 512,
        timeout: cdk.Duration.seconds(30),
        environment: {
            'GRAPHQL_URL': graphqlUrl
        },
        role: lambdaRole,
    });
  
    // Grant the lambda to access meeting-detail table
    const meetingDetailTable = Table.fromTableAttributes(this, 'MeetingDetailTable', {
        tableName: 'meeting-detail',
        tableStreamArn: Fn.importValue('MeetingDetailTableStreamArn')
    });
    meetingDetailTable.grantFullAccess(meetingDetailDynamoDBStreamLambda);
  
    // Add the lambda as a trigger on meeting-detail table
    meetingDetailDynamoDBStreamLambda.addEventSource(new DynamoEventSource(meetingDetailTable, {
        batchSize: 1,
        startingPosition: StartingPosition.TRIM_HORIZON,
        retryAttempts: 1
    }));

    // Scheduled CloudWatch jobs to update status every 30 minutes
    var dailyLambdaSchedule = Schedule.cron({
        minute: "0,30"
    });
    const attributesUpdateLambdaTarget = new LambdaFunction(specialistStatusUpdateFunction);

    new Rule(this, 'specialistStatusUpdateRule', {
        schedule: dailyLambdaSchedule,
        targets: [
            attributesUpdateLambdaTarget,
        ]
    });
  }
}
