import AWS = require('aws-sdk');
import { ServiceDeskProfileDao } from './ddb/service-desk-profile-dao';

const db = new AWS.DynamoDB.DocumentClient({ region: 'ca-central-1' });

/**
 * Creates a new service desk profile after the user confirms their signup.
 */
export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log("Creating service desk profile...");
    console.log(event);

    const userName = event["userName"];
    const name = event["request"]["userAttributes"]["name"];
    const phoneNumber = event["request"]["userAttributes"]["phone_number"];
    const email = event["request"]["userAttributes"]["email"];

    const dao = new ServiceDeskProfileDao(db);
    await dao.createServiceDeskProfile({
        name: name,
        email: email,
        phone_number: phoneNumber,
        username: userName,
    });

    // Return to Amazon Cognito
    callback(null, event);
};
