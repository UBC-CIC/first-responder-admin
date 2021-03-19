#!/usr/bin/env node
import { App } from '@aws-cdk/core';
import { FirstResponderAdminLambdaStack } from '../lib/admin-lambda-stack';
import { FirstResponderAdminDynamoStack } from '../lib/admin-dynamodb-stack';

const app = new App();
new FirstResponderAdminLambdaStack(app, 'FirstResponderAdminLambdaStack');
new FirstResponderAdminDynamoStack(app, 'FirstResponderAdminDynamoStack');
