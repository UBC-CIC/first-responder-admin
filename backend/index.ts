import apigateway = require('@aws-cdk/aws-apigateway'); 
import dynamodb = require('@aws-cdk/aws-dynamodb');
import lambda = require('@aws-cdk/aws-lambda');
import cdk = require('@aws-cdk/core');
import { Role, ServicePrincipal, PolicyDocument, PolicyStatement, Effect } from '@aws-cdk/aws-iam';


export class FirstResponderAdminBackendStack extends cdk.Stack {
  constructor(app: cdk.App, id: string) {
    super(app, id);

    const dynamoTable = new dynamodb.Table(this, 'demo', {
      partitionKey: {
        name: 'itemId',
        type: dynamodb.AttributeType.STRING
      },
      tableName: 'demo',

      // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
      // the new table, and it will remain in your account until manually deleted. By setting the policy to 
      // DESTROY, cdk destroy will delete the table (even if it has data in it)
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
    });


    const lambdaRole = new Role(this, 'First_Responder_Lambda_Role', {
        roleName: 'First_Responder_Lambda_Role',
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

    const callHandlerLambda = new lambda.Function(this, 'callHandlerFunction', {
      code: new lambda.AssetCode('build/src'),
      handler: 'call-handler.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: 'itemId'
      },
      role: lambdaRole,
      memorySize: 512,
      timeout: cdk.Duration.seconds(30)
    });

    const getOneLambda = new lambda.Function(this, 'getOneItemFunction', {
      code: new lambda.AssetCode('build/src'),
      handler: 'get-one.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: 'itemId'
      },
      memorySize: 512,
      timeout: cdk.Duration.seconds(30)
    });

    const getAllLambda = new lambda.Function(this, 'getAllItemsFunction', {
      code: new lambda.AssetCode('build/src'),
      handler: 'get-all.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: 'itemId'
      },
      memorySize: 512,
      timeout: cdk.Duration.seconds(30)
    });

    const createOne = new lambda.Function(this, 'createItemFunction', {
      code: new lambda.AssetCode('build/src'),
      handler: 'create.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: 'itemId'
      },
      memorySize: 512,
      timeout: cdk.Duration.seconds(30)
    });

    const updateOne = new lambda.Function(this, 'updateItemFunction', {
      code: new lambda.AssetCode('build/src'),
      handler: 'update-one.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: 'itemId'
      },
      memorySize: 512,
      timeout: cdk.Duration.seconds(30)
    });

    const deleteOne = new lambda.Function(this, 'deleteItemFunction', {
      code: new lambda.AssetCode('build/src'),
      handler: 'delete-one.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: 'itemId'
      },
      memorySize: 512,
      timeout: cdk.Duration.seconds(30)
    });
    
    dynamoTable.grantReadWriteData(callHandlerLambda);
    dynamoTable.grantReadWriteData(getAllLambda);
    dynamoTable.grantReadWriteData(getOneLambda);
    dynamoTable.grantReadWriteData(createOne);
    dynamoTable.grantReadWriteData(updateOne);
    dynamoTable.grantReadWriteData(deleteOne);

    const api = new apigateway.RestApi(this, 'itemsApi', {
      restApiName: 'Items Service'
    });

    const items = api.root.addResource('items');
    const getAllIntegration = new apigateway.LambdaIntegration(getAllLambda);
    items.addMethod('GET', getAllIntegration);

    const createOneIntegration = new apigateway.LambdaIntegration(createOne);
    items.addMethod('POST', createOneIntegration);
    addCorsOptions(items);

    const singleItem = items.addResource('{id}');
    const getOneIntegration = new apigateway.LambdaIntegration(getOneLambda);
    singleItem.addMethod('GET', getOneIntegration);

    const updateOneIntegration = new apigateway.LambdaIntegration(updateOne);
    singleItem.addMethod('PATCH', updateOneIntegration);

    const deleteOneIntegration = new apigateway.LambdaIntegration(deleteOne);
    singleItem.addMethod('DELETE', deleteOneIntegration);
    addCorsOptions(singleItem);
  }
}

export function addCorsOptions(apiResource: apigateway.IResource) {
  apiResource.addMethod('OPTIONS', new apigateway.MockIntegration({
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
        'method.response.header.Access-Control-Allow-Credentials': "'false'",
        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
      },
    }],
    passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
    requestTemplates: {
      "application/json": "{\"statusCode\": 200}"
    },
  }), {
    methodResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Credentials': true,
        'method.response.header.Access-Control-Allow-Origin': true,
      },  
    }]
  })
}

const app = new cdk.App();
new FirstResponderAdminBackendStack(app, 'FirstResponderAdminBackend');
app.synth();
