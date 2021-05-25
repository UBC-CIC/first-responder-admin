# Emergency Service Desk 

## Project Summary
The Emergency Service Desk serves to assist emergency responders in connecting with medical experts and receiving appropriate medical expertise promptly, especially in rural areas where responders are essentially 'alone'. Emergency Responders connect to the Service Desk, where an attendee can assist them, and connect them to a specialist who can provide medical expertise. The Service Desk supports geo-location, and provides a dashboard for managing ongoing emergency calls. The App is Powered by Amazon Chime, supporting video, audio, and text chat. 

This project is a pre-requisite for the [First Responder Mobile App](https://github.com/UBC-CIC/first-responder-mobile-app)

## Table of Contents
- [Dependencies](#Dependencies)
- [Deployment](#Deployment)
- [Development Instructions](#Development)

## Dependencies
- Install the [AWS CLI](https://aws.amazon.com/cli/) tool.
- Install the [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/cli.html) CLI tool.
- Install the [Amplify CLI](https://docs.amplify.aws/cli) tool.
- Configure the AWS CLI tool for your AWS Account in the `ca-central-1` region, using a user with programmatic access and the "AdministratorAccess" policy (moving forward, we will assume you have [configured a profile](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/configure/index.html) called `firstresponder`):
  > `aws configure --profile firstresponder`

## Deployment
### Backend
The `backend` folder contains AWS CDK stacks and AWS Lambda function code that will manage the data stores and corresponding interactions with the Service Desk dashboard, handle incoming Amazon Chime PSTN or app triggered calls, handle the paging of specialists, and cleanup disconnected calls.

Run `cd backend` and follow the instructions in [backend/README.md](./backend/README.md)

### Common
The `common` folder contains the GraphQL schema that is used by both the backend and frontend website.

After performing any model changes to `schema.graphql`, run the following commands from within the `common` directory:
```
amplify codegen types
amplify codegen statements
amplify-graphql-docs-generator --schema graphql/schema.graphql --output ./graphql --language typescript --separateFiles --maxDepth 10
```

Double check that the `*.ts` and `*.graphql` files have been properly updated.


### Frontend
The `frontend` folder contains the Service Desk dashboard as a React app.

Run `cd frontend` and follow the instructions in [frontend/README.md](./frontend/README.md)


## License
This project is distributed under the [MIT License](./LICENSE).
