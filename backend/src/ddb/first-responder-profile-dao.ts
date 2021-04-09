import { DocumentClient } from "aws-sdk/clients/dynamodb";

export type FirstResponderProfile = {
    "first_name": string; // First Name (e.g. "John")
    "last_name": string; // Last Name (e.g. "Doe")
    "phone_number": string; // Phone Number (e.g. "+16041111111")
    "occupation": string; // User Role (e.g. "First Aid Attendant")
    "organization": string; // Organization (e.g. "Talicum Mining")
};

export class FirstResponderProfileDao {
    db: DocumentClient

    constructor(db: DocumentClient) {
        this.db = db;
    }

    /**
     * Create a first responder profile.
     * 
     * @param userProfile The user profile to save.
     */
    async createFirstResponderProfile(userProfile: FirstResponderProfile): Promise<Boolean> {
        const existingUserProfile = await this.getFirstResponderProfile(userProfile.phone_number);
        if (existingUserProfile) {
            // If any existing user profile exists, we should not attempt to create a new profile.
            return false;
        }

        const params = {
            TableName: 'first-responder-profile',
            Item: userProfile
        };
        await this.db.put(params).promise();
        return true;
    }

    /**
     * Saves a first responder profile.
     * 
     * @param userProfile The user profile to save.
     */
    async saveFirstResponderProfile(userProfile: FirstResponderProfile): Promise<void> {
        const params = {
            TableName: 'first-responder-profile',
            Item: userProfile
        };

        await this.db.put(params).promise();
    }

    /**
     * Retrieves a first responder profile by their phone number.
     * 
     * @param phoneNumber Gets a user profile by their phone number.
     * @returns The meeting if it exists.
     */
    async getFirstResponderProfile(phoneNumber: string): Promise<FirstResponderProfile> {
        const params: DocumentClient.GetItemInput = {
            TableName: 'first-responder-profile',
            Key: {
                "phone_number": phoneNumber
            }
        };
        const result = await this.db.get(params).promise();
        return result?.Item as FirstResponderProfile;
    }

    /**
     * Retrieves all first responder profiles that match the provided search parameters.
     * 
     * @returns The first responder profiles.
     */
    async getFirstResponders(): Promise<FirstResponderProfile[]> {
        const params: DocumentClient.QueryInput = {
            TableName: 'first-responder-profile',
        };

        const scanResults: FirstResponderProfile[] = [];
        var items: DocumentClient.QueryOutput;
        do {
            items = await this.db.query(params).promise();
            items.Items?.forEach((item) => {
                const a = item as FirstResponderProfile;
                scanResults.push(a);
            });
            params["ExclusiveStartKey"] = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey !== "undefined");

        return scanResults;
    }
}
