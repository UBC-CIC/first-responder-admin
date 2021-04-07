# First Responder Admin Frontend

Contains React code that runs the First Responder Admin Service Desk website.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
## Setup
### Prerequisites

* Ensure graphql dependencies are available.
Follow the instructions [here](../common/README.md) to do so.
* Make sure backend infrastructure and code is deployed. If its not deployed follow these [instructions](../backend/README.md) to do so.
* Once the backend is deployed, update [`aws-exports.json`](./src/aws-exports.json) to point to correct AppSync API and Cognito user pool.

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