import AWS = require('aws-sdk');
import { UserProfileDao } from './ddb/user-profile-dao';

const db = new AWS.DynamoDB.DocumentClient({ region: 'ca-central-1' });

/**
 * Updates the user status at regular intervals based on their specified schedule.
 */
export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log("Creating user statuses...")
    const dao = new UserProfileDao(db);
    await dao.createUserProfile(event["user_profile"]);
    console.log("Create status updated");
};
