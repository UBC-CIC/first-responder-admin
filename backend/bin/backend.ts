#!/usr/bin/env node
import { App } from '@aws-cdk/core';
import { FirstResponderAdminLambdaStack } from '../lib/admin-lambda-stack';
import { StarsDynamoStack } from '../lib/dynamodb-stack';

const app = new App();
new FirstResponderAdminLambdaStack(app, 'FirstResponderAdminLambdaStack');
new StarsDynamoStack(app, 'StarsDynamoStack');
