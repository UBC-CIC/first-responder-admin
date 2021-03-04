# First Responder Admin Backend

Contains infrastructure and Lambda functions that runs the First Responder Admin backend.

## Setup

Install the core dependencies:
```
npm install -g aws-cdk
npm install
npm run build
```

Install dependencies required by the Lambda functions. Note that this generates a separate `node_modules` directory because everything under the `src` folder will be uploaded to Lambda and we want to exclude the packages (e.g. `aws-sdk`) that already comes with Lambda:
```
cd src/
npm install
```

Deploy (run this from the root):
```
npm run build
cdk deploy
```

Clean (run this from the root):
```
npm run clean
```

Misc CDK commands:
```
$ cdk ls
<list all stacks in this program>

$ cdk synth
<generates and outputs cloudformation template>

$ cdk deploy
<deploys stack to your account>

$ cdk diff
<shows diff against deployed stack>
```