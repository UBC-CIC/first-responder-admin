#!/usr/bin/env node
import { App } from '@aws-cdk/core';
import { FirstResponderAdminLambdaStack } from '../lib/admin-lambda-stack';
import { FirstResponderAdminDynamoStack } from '../lib/admin-dynamodb-stack';
import { FirstResponderAdminAppSyncStack } from '../lib/admin-appsync-stack';
import { FirstResponderAdminCognitoStack } from '../lib/admin-cognito-stack';

const app = new App();
new FirstResponderAdminLambdaStack(app, 'FirstResponderAdminLambdaStack');
new FirstResponderAdminDynamoStack(app, 'FirstResponderAdminDynamoStack');

const cognito = new FirstResponderAdminCognitoStack(app, 'FirstResponderAdminCognitoStack');
const appSync = new FirstResponderAdminAppSyncStack(app, 'FirstResponderAdminAppSyncStack', cognito.UserPoolId);
