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
        super(scope, id);

        const meetingDetailResolverPath = './vtl/resolvers/meeting-detail'

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
        const firstResponderAdminMeetingDetailTable = Table.fromTableName(this, 
            'firstResponderAdminMeetingDetailTable', FirstResponderAdminDynamoStack.MEETING_DETAIL_TABLE_NAME);
        firstResponderAdminMeetingDetailTable.grantFullAccess(firstResponderAdminAppSyncRole);

        // Define Request DDB DataSource
        const firstResponderAdminTableDataSource = api.addDynamoDbDataSource('firstResponderAdminMeetingDetailTableDataSource',firstResponderAdminMeetingDetailTable);

        firstResponderAdminTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'getMeetingDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.getMeetingDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.getMeetingDetail.res.vtl`),
        });

        firstResponderAdminTableDataSource.createResolver({
            typeName: 'Query',
            fieldName: 'listMeetingDetails',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.listMeetingDetails.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Query.listMeetingDetails.req.vtl`),
        });

        firstResponderAdminTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'createMeetingDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.createMeetingDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.createMeetingDetail.res.vtl`),
        });

        firstResponderAdminTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'deleteMeetingDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.deleteMeetingDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.deleteMeetingDetail.res.vtl`),
        });

        firstResponderAdminTableDataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'updateMeetingDetail',
            requestMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.updateMeetingDetail.req.vtl`),
            responseMappingTemplate: MappingTemplate.fromFile(`${meetingDetailResolverPath}/Mutation.updateMeetingDetail.res.vtl`),
        });

        new CfnOutput(this, "GraphQLEndpoint", {
            value: api.graphqlUrl
        });

        new CfnOutput(this, "GraphQLAuthorizationType", {
            value: authorizationType
        });
    }
}