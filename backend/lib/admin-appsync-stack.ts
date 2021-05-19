import { CfnOutput, Construct, Stack } from '@aws-cdk/core';
import {
    AuthorizationType,
    FieldLogLevel,
    GraphqlApi,
    MappingTemplate,
    Schema,
    UserPoolDefaultAction
} from '@aws-cdk/aws-appsync';
import { UserPool } from '@aws-cdk/aws-cognito';
import { Table } from '@aws-cdk/aws-dynamodb';
import { CompositePrincipal, ManagedPolicy, Role, PolicyDocument, ServicePrincipal, Effect, PolicyStatement } from '@aws-cdk/aws-iam'
import { FirstResponderAdminDynamoStack } from './admin-dynamodb-stack';
import lambda = require('@aws-cdk/aws-lambda');
import cdk = require('@aws-cdk/core');

/**
 * FirstResponderAdminAppSyncStack defines a GraphQL API for accessing meeting-detail table.
 *
 */
export class FirstResponderAdminAppSyncStack extends Stack {
    public readonly GraphQLUrl: string;

    constructor(scope: Construct, id: string, userPoolId: string) {
        super(scope, id, {
            env: {
              region: 'ca-central-1'
            },
          });

        const meetingDetailResolverPath = './vtl/resolvers/meeting-detail'
        const specialistProfileResolverPath = './vtl/resolvers/specialist-profile'
        const serviceDeskProfileResolverPath = './vtl/resolvers/service-desk-profile'

        const authorizationType = AuthorizationType.USER_POOL;
        const userPool = UserPool.fromUserPoolId(this, 'UserPool', userPoolId);
        const api = new GraphqlApi(this, 'firstResponderAdminsGraphQLAPI', {
            name: 'firstResponderAdminsGraphQLAPI',
            schema: Schema.fromAsset('../common/graphql/schema.graphql'),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: authorizationType,
                    userPoolConfig: {
                        userPool: userPool,
                        defaultAction: UserPoolDefaultAction.ALLOW,
                    }
                },
                additionalAuthorizationModes: [{
                    authorizationType: AuthorizationType.IAM,
                }],
            },
            xrayEnabled: true,
            logConfig: {
                fieldLogLevel: FieldLogLevel.ALL,
            },
        });
        this.GraphQLUrl = api.graphqlUrl

        // Create AppSyncRole
        const firstResponderAdminAppSyncRole = new Role(this, 'firstResponderAdminAppSyncRole', {
            roleName: 'first-responder-admin-app-sync-role',
            assumedBy: new CompositePrincipal(new ServicePrincipal('appsync.amazonaws.com'),
                new ServicePrincipal('lambda.amazonaws.com')),
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
                ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'),
                ManagedPolicy.fromAwsManagedPolicyName('AWSAppSyncInvokeFullAccess')
            ]
        });
        firstResponderAdminAppSyncRole.addToPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'sts:AssumeRole'
            ],
            resources: ['*']
        }))

        // DynamoDB DataSource
        
        // DataSource to connect to meeting-detail DDB table
        // Import meeting-detail DDB table and grant AppSync to access the DDB table
        const meetingDetailTable = Table.fromTableAttributes(this, 
            'meetingDetailTable', {
                tableName: FirstResponderAdminDynamoStack.MEETING_DETAIL_TABLE_NAME,
                globalIndexes: [FirstResponderAdminDynamoStack.MEETING_STATUS_GLOBAL_INDEX_NAME]
            });
        meetingDetailTable.grantFullAccess(firstResponderAdminAppSyncRole);

        // Define Request DDB DataSource
        const meetingDetailTableDataSource = api.addDynamoDbDataSource('meetingDetailTableDataSource', meetingDetailTable);

        meetingDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getMeetingDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.getMeetingDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.getMeetingDetail.res.vtl`),
        });

        meetingDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'listMeetingDetails',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.listMeetingDetails.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.listMeetingDetails.res.vtl`),
        });

        meetingDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getMeetingDetailsByStatus',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.getMeetingDetailsByStatus.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.getMeetingDetailsByStatus.res.vtl`),
        });

        meetingDetailTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getMeetingDetailsByStatusAndCreateTime',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.getMeetingDetailsByStatusAndCreateTime.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.getMeetingDetailsByStatusAndCreateTime.res.vtl`),
        });

        meetingDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'createMeetingDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.createMeetingDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.createMeetingDetail.res.vtl`),
        });

        meetingDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'deleteMeetingDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.deleteMeetingDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.deleteMeetingDetail.res.vtl`),
        });

        meetingDetailTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'updateMeetingDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.updateMeetingDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.updateMeetingDetail.res.vtl`),
        });

        // None DataSource
        //
        // Add None DataSource for Local Resolver - to publish notification triggered by meeting-detail DDB
        const newMeetingDetailNoneDataSource = api.addNoneDataSource('NewMeetingDetailNoneDataSource');
        newMeetingDetailNoneDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'publishNewMeetingDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/None.publishNewMeetingDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/None.publishNewMeetingDetail.res.vtl`)
        });
        const meetingDetailNoneDataSource = api.addNoneDataSource('MeetingDetailNoneDataSource');
        meetingDetailNoneDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'publishMeetingDetailUpdates',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/None.publishMeetingDetailUpdates.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/None.publishMeetingDetailUpdates.res.vtl`)
        });

        // DataSource to connect to specialist-profile DDB table
        // Import specialist-profile DDB table and grant AppSync to access the DDB table
        const specialistProfileTable = Table.fromTableAttributes(this, 
            'specialistProfileTable', {
                tableName: FirstResponderAdminDynamoStack.SPECIALIST_PROFILE_TABLE_NAME,
                globalIndexes: [FirstResponderAdminDynamoStack.SPECIALIST_USER_STATUS_GLOBAL_INDEX_NAME]
            });
        specialistProfileTable.grantFullAccess(firstResponderAdminAppSyncRole);

        const specialistProfileTableDataSource = api.addDynamoDbDataSource('specialistProfileTableDataSource', specialistProfileTable);

        specialistProfileTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'createSpecialistProfile',
            requestMappingTemplate: MappingTemplate.fromFile(`${specialistProfileResolverPath}/Mutation.createSpecialistProfile.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${specialistProfileResolverPath}/Mutation.createSpecialistProfile.res.vtl`),
        });

        specialistProfileTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'deleteSpecialistProfile',
            requestMappingTemplate: MappingTemplate.fromFile(`${specialistProfileResolverPath}/Mutation.deleteSpecialistProfile.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${specialistProfileResolverPath}/Mutation.deleteSpecialistProfile.res.vtl`),
        });

        specialistProfileTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'updateSpecialistProfile',
            requestMappingTemplate: MappingTemplate.fromFile(`${specialistProfileResolverPath}/Mutation.updateSpecialistProfile.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${specialistProfileResolverPath}/Mutation.updateSpecialistProfile.res.vtl`),
        });

        specialistProfileTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getSpecialistProfile',
            requestMappingTemplate: MappingTemplate.fromFile(`${specialistProfileResolverPath}/Query.getSpecialistProfile.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${specialistProfileResolverPath}/Query.getSpecialistProfile.res.vtl`),
        });

        specialistProfileTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getSpecialistProfilesByStatus',
            requestMappingTemplate: MappingTemplate.fromFile(`${specialistProfileResolverPath}/Query.getSpecialistProfilesByStatus.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${specialistProfileResolverPath}/Query.getSpecialistProfilesByStatus.res.vtl`),
        });

        // DataSource to connect to service-desk-profile DDB table
        // Import service-desk-profile DDB table and grant AppSync to access the DDB table
        const serviceDeskProfileTable = Table.fromTableAttributes(this, 
            'serviceDeskProfileTable', {
                tableName: FirstResponderAdminDynamoStack.SERVICE_DESK_TABLE_NAME
            });
        serviceDeskProfileTable.grantFullAccess(firstResponderAdminAppSyncRole);

        const serviceDeskProfileTableDataSource = api.addDynamoDbDataSource('serviceDeskProfileTableDataSource', serviceDeskProfileTable);

        serviceDeskProfileTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getServiceDeskProfile',
            requestMappingTemplate: MappingTemplate.fromFile(`${serviceDeskProfileResolverPath}/Query.getServiceDeskProfile.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${serviceDeskProfileResolverPath}/Query.getServiceDeskProfile.res.vtl`),
        });


        // Define Lambda Role and Data Source
        const lambdaRole = new Role(this, 'FirstResponderAppSyncLambdaRole', {
            roleName: 'FirstResponderAppSyncLambdaRole',
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            inlinePolicies: {
                additional: new PolicyDocument({
                        statements: [
                        new PolicyStatement({
                            effect: Effect.ALLOW,
                            actions: [
                                // Chime
                                'chime:CreateMeeting',
                                'chime:GetMeeting',
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
                                // SES
                                'ses:*',
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
    
        const joinMeetingFunction = new lambda.Function(this, 'joinMeetingFunction', {
            functionName: "FirstResponder-Data-ChimeMeeting-Join",
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

        // Define Lambda DataSource and Resolver - make sure mutations are defined in schema.graphql
        //
        // Resolver for Chime meeting operations
        api.addLambdaDataSource('JoinMeetingDataSource', joinMeetingFunction).createResolver({
            typeName: 'Mutation',
            fieldName: 'joinMeeting'
        });

        const endMeetingFunction = new lambda.Function(this, 'endMeetingFunction', {
            functionName: "FirstResponder-Data-ChimeMeeting-End",
            code: new lambda.AssetCode('build/src'),
            handler: 'data-cleanup.handler',
            runtime: lambda.Runtime.NODEJS_10_X,
            environment: {
              TABLE_NAME: FirstResponderAdminDynamoStack.MEETING_DETAIL_TABLE_NAME,
              PRIMARY_KEY: 'meeting_id',
            },
            role: lambdaRole,
            memorySize: 512,
            timeout: cdk.Duration.seconds(30)
          });

        // Define Lambda DataSource and Resolver - make sure mutations are defined in schema.graphql
        //
        // Resolver for Chime meeting operations
        api.addLambdaDataSource('EndMeetingDataSource', endMeetingFunction).createResolver({
            typeName: 'Mutation',
            fieldName: 'endMeeting'
        });

        const notifySpecialistFunction = new lambda.Function(this, 'notifySpecialistFunction', {
            functionName: "FirstResponder-Notify-Specialist-AppSync",
            code: new lambda.AssetCode('build/src'),
            handler: 'notify-specialist.handler',
            runtime: lambda.Runtime.NODEJS_10_X,
            environment: {
              JOIN_PHONE_NUMBER: "+1 (888) 599-8558",
              CALL_URL: "https://localhost:3000/call",
              SES_FROM_ADDRESS: "fristrespondertest@gmail.com"
            },
            role: lambdaRole,
            memorySize: 512,
            timeout: cdk.Duration.seconds(30)
          });

        // Resolver for specialist notifications
        api.addLambdaDataSource('NotifySpecialistDataSource', notifySpecialistFunction).createResolver({
            typeName: 'Mutation',
            fieldName: 'notifySpecialist'
        });

        // Cloudformation Output
        new CfnOutput(this, "GraphQLEndpoint", {
            value: api.graphqlUrl
        });

        new CfnOutput(this, "GraphQLAuthorizationType", {
            value: authorizationType
        });
    }
}