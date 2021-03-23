import AWS = require('aws-sdk');
import { SpecialistProfileDao } from './ddb/specialist-profile-dao';

const db = new AWS.DynamoDB.DocumentClient({ region: 'ca-central-1' });

/**
 * Updates the user status at regular intervals based on their specified schedule.
 */
export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log("Creating user statuses...")
    const dao = new SpecialistProfileDao(db);
    await dao.createSpecialistProfile(event["user_profile"]);
    console.log("Create status updated");
};
