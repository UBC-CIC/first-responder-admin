import AWS = require('aws-sdk');
import { UserProfileDao } from './ddb/user-profile-dao';

const db = new AWS.DynamoDB.DocumentClient({ region: 'ca-central-1' });

/**
 * Updates the user status at regular intervals based on their specified schedule.
 */
export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log("Updating user statuses...")
    const dao = new UserProfileDao(db);
    await dao.updateUserStatusBasedOnAvailability();
    console.log("User status updated");
};
