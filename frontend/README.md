# First Responder Admin Frontend

Contains React code that runs the First Responder Admin Service Desk website.

## Deployment

#### Prerequisites

* Ensure graphql dependencies are available.
Follow the instructions [here](..backend/src/common/README.md) to do so.
* Make sure backend infrastructure and code is deployed. If its not deployed follow these [instructions](../backend/README.md) to do so.
#### Step 1

Add the AWS configuration for cognito and appsync end point so that frontend website can call backend APIS. Commit below configuration at `frontend/src/aws-exports.json`:-

```
{
    "FirstResponderAdminAppSync": {
      "GraphQLEndpoint": "",
      "Region": "",
      "GraphQLAuthorizationType": "AMAZON_COGNITO_USER_POOLS",
      "DangerouslyConnectToHTTPEndpointForTesting": false
    },
    "FirstResponderAdminCognito": {
      "UserPoolClientId": "",
      "Region": "",
      "UserPoolId": "",
      "AuthenticatedRole": "",
      "IdentityPoolId": "",
      "UserPoolDomainPrefix": "first-responder-admin",
      "UnauthenticatedRole": ""
    }
  }
```
`Note`: Login to AWS console to get the AppSync GraphQL API endpoint and Cognito configuration.
#### Step 2

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/UBC-CIC/first-responder-admin/tree/main)

## Development Setup
### Prerequisites

* Ensure graphql dependencies are available.
Follow the instructions [here](..backend/src/common/README.md) to do so.
* Make sure backend infrastructure and code is deployed. If its not deployed follow these [instructions](../backend/README.md) to do so.
* Once the backend is deployed, create `aws-exports.json` file as described above to point to correct AppSync API and Cognito user pool.

### Steps

Install the core dependencies:

```
npm install
npm run build
```

Start local server:

```
npm start
```

## Available scripts
### `npm install`
This installs the node modules specified in `package.json`.
### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.