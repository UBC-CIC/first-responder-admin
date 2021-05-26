import lambda = require('@aws-cdk/aws-lambda');
import cdk = require('@aws-cdk/core');
import { Role, ServicePrincipal, PolicyDocument, PolicyStatement, Effect } from '@aws-cdk/aws-iam';
import { Bucket, BucketEncryption, } from '@aws-cdk/aws-s3';
import events = require('@aws-cdk/aws-events');
import eventsTargets = require('@aws-cdk/aws-events-targets');
import { FirstResponderAdminDynamoStack } from './admin-dynamodb-stack';
import s3deploy = require('@aws-cdk/aws-s3-deployment');
// The Lambdas for PSTN stack must be created in us-east-1 or us-west-2 since Chime only supports one of these two regions.
//


export class FirstResponderAdminLambdaPSTNStack extends cdk.Stack {
  constructor(app: cdk.App, id: string) {
    super(app, id, {
      env: {
        region: 'us-east-1'
      },
    });


    // Contains audio clips that are used as part of the Chime PSTN network.
    const pstnAudioFilesBucket = new Bucket(this, 'FirstResponderAudio', {
      encryption: BucketEncryption.S3_MANAGED
    });

    const PSTN_BUCKET_NAME = pstnAudioFilesBucket.bucketName;
  
    pstnAudioFilesBucket.addToResourcePolicy(
      new PolicyStatement({
        resources: [  
          `arn:aws:s3:::${PSTN_BUCKET_NAME}/*`,
        ],
        actions: ["s3:GetObject", "s3:PutObject", "s3:PutObjectAcl"],
        principals: [new ServicePrincipal("voiceconnector.chime.amazonaws.com")],
      })
    )

    new s3deploy.BucketDeployment(this, "DeployAudioFiles", {
      destinationBucket: pstnAudioFilesBucket, 
      contentType:"audio/wav",
      sources: [s3deploy.Source.asset('./audio')]
    });

    const lambdaRole = new Role(this, 'FirstResponderLambdaPSTNRole', {
        roleName: 'FirstResponderLambdaPSTNRole',
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

    const pstnCreateFunction = new lambda.Function(this, 'pstnCreateFunction', {
      functionName: "FirstResponder-PSTN-Create",
      code: new lambda.AssetCode('build/src'),
      handler: 'pstn-create.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: FirstResponderAdminDynamoStack.MEETING_DETAIL_TABLE_NAME,
        PRIMARY_KEY: 'meeting_id',
        BUCKET_NAME: PSTN_BUCKET_NAME,
      },
      role: lambdaRole,
      memorySize: 512,
      timeout: cdk.Duration.seconds(30)
    });

    const pstnJoinFunction = new lambda.Function(this, 'pstnJoinFunction', {
      functionName: "FirstResponder-PSTN-Join",
      code: new lambda.AssetCode('build/src'),
      handler: 'pstn-join.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: FirstResponderAdminDynamoStack.MEETING_DETAIL_TABLE_NAME,
        PRIMARY_KEY: 'meeting_id',
        BUCKET_NAME: PSTN_BUCKET_NAME,
      },
      role: lambdaRole,
      memorySize: 512,
      timeout: cdk.Duration.seconds(30)
    });

    const meetingCleanupFunction = new lambda.Function(this, 'meetingCleanupFunction', {
      functionName: "FirstResponder-Meeting-Cleanup",
      code: new lambda.AssetCode('build/src'),
      handler: 'meeting-cleanup.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      role: lambdaRole,
      memorySize: 512,
      timeout: cdk.Duration.seconds(30)
    });

    const chimeEventRule = new events.Rule(this, 'ChimeEventRule', {
      eventPattern: {
        source: [
          'aws.chime'
        ],
        detailType: [
          'Chime Meeting State Change',
        ],
        detail: {
          'eventType': [
            'chime:MeetingStarted',
            'chime:AttendeeLeft',
            'chime:MeetingEnded',
          ]
        }
      },
      targets: [
          new eventsTargets.LambdaFunction(meetingCleanupFunction)
      ],
    });
  }
}
