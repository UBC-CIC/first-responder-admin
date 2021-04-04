import { CfnOutput, Construct, Duration, Stack } from '@aws-cdk/core';
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
import { CompositePrincipal, ManagedPolicy, Role, ServicePrincipal, Effect, PolicyStatement } from '@aws-cdk/aws-iam'
import { FirstResponderAdminDynamoStack } from './admin-dynamodb-stack';

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
        //
        // DataSource to connect to meeting-detail DDB table
        // Import meeting-detail DDB table and grant AppSync to access the DDB table
        const meetingDetailTable = Table.fromTableAttributes(this, 
            'meetingDetailTable', {
                tableName: FirstResponderAdminDynamoStack.MEETING_DETAIL_TABLE_NAME,
                globalIndexes: [FirstResponderAdminDynamoStack.MEETING_STATUS_GLOBAL_INDEX_NAME]
            });
        meetingDetailTable.grantFullAccess(firstResponderAdminAppSyncRole);

        const specialistProfileTable = Table.fromTableAttributes(this, 
            'specialistProfileTable', {
                tableName: FirstResponderAdminDynamoStack.SPECIALIST_PROFILE_TABLE_NAME,
                globalIndexes: [FirstResponderAdminDynamoStack.SPECIALIST_USER_STATUS_GLOBAL_INDEX_NAME]
            });
        specialistProfileTable.grantFullAccess(firstResponderAdminAppSyncRole);

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

        // None DataSource
        //
        // Add None DataSource for Local Resolver - to publish notification triggered by meeting-detail DDB
        const meetingDetailNoneDataSource = api.addNoneDataSource('MeetingDetailNoneDataSource');
        meetingDetailNoneDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'publishMeetingDetailUpdates',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/None.publishMeetingDetailUpdates.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/None.publishMeetingDetailUpdates.res.vtl`)
        });

        new CfnOutput(this, "GraphQLEndpoint", {
            value: api.graphqlUrl
        });

        new CfnOutput(this, "GraphQLAuthorizationType", {
            value: authorizationType
        });
    }
}