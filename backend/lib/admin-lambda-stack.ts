import lambda = require('@aws-cdk/aws-lambda');
import cdk = require('@aws-cdk/core');
import { App, Duration } from '@aws-cdk/core';
import { Role, ServicePrincipal, PolicyDocument, PolicyStatement, Effect } from '@aws-cdk/aws-iam';
import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import { Schedule, Rule } from '@aws-cdk/aws-events';
import events = require('@aws-cdk/aws-events');
import eventsTargets = require('@aws-cdk/aws-events-targets');
import { FirstResponderAdminDynamoStack } from './admin-dynamodb-stack';
import { LambdaFunction } from "@aws-cdk/aws-events-targets";

// The Lambda stack contains all the Lambda functions that are not directly related to Chime. 
// These Lambda functions can be created safely in ca-central-1.
//
export class FirstResponderAdminLambdaStack extends cdk.Stack {
  constructor(app: cdk.App, id: string) {
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
                            'logs:*'
                        ],
                        resources: ['*']
                    })
                ]
            }),
        },
    });

    const userCreateFunction = new lambda.Function(this, 'userCreateFunction', {
        functionName: "FirstResponder-User-Create",
        code: new lambda.AssetCode('build/src'),
        handler: 'user-status-create.handler',
        runtime: lambda.Runtime.NODEJS_10_X,
        role: lambdaRole,
        memorySize: 512,
        timeout: cdk.Duration.seconds(300),
    });

    const userStatusUpdateFunction = new lambda.Function(this, 'userStatusUpdateFunction', {
        functionName: "FirstResponder-User-Status-Update",
        code: new lambda.AssetCode('build/src'),
        handler: 'user-status-update.handler',
        runtime: lambda.Runtime.NODEJS_10_X,
        role: lambdaRole,
        memorySize: 512,
        timeout: cdk.Duration.seconds(300), 
    });

    // Scheduled CloudWatch jobs to update status every 30 minutes
    var dailyLambdaSchedule = Schedule.cron({
        minute: "0,30"
    });
    const attributesUpdateLambdaTarget = new LambdaFunction(userStatusUpdateFunction);

    new Rule(this, 'userStatusUpdateRule', {
        schedule: dailyLambdaSchedule,
        targets: [
            attributesUpdateLambdaTarget,
        ]
    });
  }
}

const app = new cdk.App();
new FirstResponderAdminLambdaStack(app, 'FirstResponderAdminLambda');
app.synth();
