# First Responder Admin Backend

The `backend` folder contains AWS CDK stacks and AWS Lambda function code that will manage the data stores and corresponding interactions with the Service Desk dashboard, handle incoming Amazon Chime PSTN or app triggered calls, handle the paging of specialists, and cleanup disconnected calls.

## Table of Contents
- [Deployment](#deployment)
    - [Install](#install)
    - [CDK Deployment](#cdk-deployment)
    - [Provisiong Phone Numbers](#provisiong-phone-numbers)
    - [Set Up Amazon Chime SIP Media Application](#set-up-amazon-chime-sip-media-application)

## Deployment

### Install
Install the core dependencies:
```
npm install
```

Install dependencies required by the AWS Lambda functions. Note that this generates a separate `node_modules` directory in the `src` folder. This is done because everything under the `src` folder will be uploaded to AWS Lambda and we want to exclude the packages (e.g. `aws-sdk`) that already comes with AWS Lambda:
```
cd src/
npm install
cd ..
```

### CDK Deployment
Initialize the CDK stacks (required only if you have not deployed this stack before). Note that by default, all stacks are created in `ca-central-1`, except for the the PSTN stack which must be created in `us-east-1` due to region restriction in the AWS Chime SDK:
```
cdk synth --profile firstresponder
cdk bootstrap aws://YOUR_AWS_ACCOUNT_ID/ca-central-1 --profile firstresponder
cdk bootstrap aws://YOUR_AWS_ACCOUNT_ID/us-east-1 --profile firstresponder
```

Deploy the CDK stacks (this will take ~10 min):
```
npm run build
cdk deploy --all --profile firstresponder
```

You may also deploy the stacks individually:
```
cdk deploy FirstResponderAdminDynamoStack  --profile firstresponder
cdk deploy FirstResponderAdminLambdaPSTNStack  --profile firstresponder
cdk deploy FirstResponderAdminLambdaStack  --profile firstresponder
cdk deploy FirstResponderAdminCognitoStack --profile firstresponder
cdk deploy FirstResponderAdminAppSyncStack --profile firstresponder
```

Create an AWS Location Services map.
```
aws location create-map --configuration "Style=VectorEsriTopographic" --map-name firstrespondermap --pricing-plan "RequestBasedUsage" --region us-east-1 --profile firstresponder
```

### Provisiong Phone Numbers

> :warning: **Head's Up**: Phone number provisioning is not immediately available with a new account. Please file an AWS Support Case to get access to phone number provisioning as needed (note that you can still connect the mobile app without provisioning a phone number).

Manually provision phone numbers that first-responders or specialists can call to join the meeting in the event they cannot use the mobile app:
- On the AWS console, navigate to the Amazon Chime page.
- On the left pane, click "Phone number management".
- On the right pane, click "Orders" then "Provision phone numbers".
- In the popup, select "Business Calling". 
- On the next step, search for an available phone number using the filters provided. Note that in a production setting, we recommend provisioning a toll-free number. 
- Provision **two phone numbers** (one will be used to create new meetings, the other will be used to join existing meetings)

Save phone numbers to parameter store.
```
aws ssm put-parameter --name /firstresponder/joinPhoneNumber --value <provisioned join phone number> --type String --overwrite --profile firstresponder
aws ssm put-parameter --name /firstresponder/joinPhoneNumber --value <provisioned create phone number> --type String --overwrite --profile firstresponder
```

If you deployed the Mobile App, if must be re-deployed after updating phone numbers.
### Set Up Amazon Chime SIP Media Application
> :warning: **Head's Up**: Perform this step only if you have been able to successfully provision a phone number.

Amazon Chime's SIP media application will allow you to route an incoming call to the Lambda function you deployed earlier. 

We will create **two SIP media applications** (one to handle new meetings, one to join existing meetings).

#### SIP Media Application (Create Meeting)
- On the AWS console, navigate to the Amazon Chime page.
- On the left pane, click "Phone number management".
- Click "Create" to create a SIP media application with the following parameters:
    - **Name**: "JoinMeetingSIP"
    - **AWS region**: US East (N. Virginia)
    - **Lambda function ARN**: arn:aws:lambda:us-east-1:YOUR_AWS_ACCOUNT_ID:function:FirstResponder-PSTN-Create
- Create a SIP rule:
    - **Name**: CreateMeetingSIPRule
    - **Trigger Type**: To phone number
    - **Phone number**: Choose one of the provisioned phone numbers

#### SIP Media Application (Join Meeting)
- On the AWS console, navigate to the Amazon Chime page.
- On the left pane, click "Phone number management".
- Click "Create" to create a SIP media application with the following parameters:
    - **Name**: "JoinMeetingSIP"
    - **AWS region**: US East (N. Virginia)
    - **Lambda function ARN**: arn:aws:lambda:us-east-1:503829950931:function:FirstResponder-PSTN-Join
- Create a SIP rule:
    - **Name**: JoinMeetingSIPRule
    - **Trigger Type**: To phone number
    - **Phone number**: Choose one of the provisioned phone numbers

#### Updating GraphQL Schema

The `backend/src/common` folder contains the GraphQL schema that is used by both the backend and frontend website.

After performing any model changes to `schema.graphql`, run the following commands from within the `common` directory:
```
amplify codegen types                                       # generates backend/src/common/types/API.ts
amplify-graphql-docs-generator --schema graphql/schema.graphql --output ./graphql --language typescript --separateFiles --maxDepth 10                               # generates backend/src/common/graphql/mutation.ts, backend/src/common/graphql/query.ts, backend/src/common/graphql/subscriptions.ts
```

Double check that the `*.ts` and `*.graphql` files have been properly updated.

More detailed instructions in [here](src/common/README.md).
