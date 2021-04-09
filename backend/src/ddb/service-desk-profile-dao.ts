import { DocumentClient } from "aws-sdk/clients/dynamodb";

export type ServiceDeskProfile = {
    "name": string; // Full Name (e.g. "John Doe")
    "phone_number": string; // Phone Number (e.g. "+16041111111")
    "email": string; // Email (e.g. "abc@xyz.com")
    "username": string; // Username (e.g. john.doe)
};

export class ServiceDeskProfileDao {
    db: DocumentClient

    constructor(db: DocumentClient) {
        this.db = db;
    }

    /**
     * Create a service desk profile.
     * 
     * @param userProfile The user profile to save.
     */
    async createServiceDeskProfile(userProfile: ServiceDeskProfile): Promise<Boolean> {
        const existingUserProfile = await this.getServiceDeskProfile(userProfile.email);
        if (existingUserProfile) {
            // If any existing user profile exists, we should not attempt to create a new profile.
            return false;
        }

        const params = {
            TableName: 'service-desk-profile',
            Item: userProfile
        };
        await this.db.put(params).promise();
        return true;
    }

    /**
     * Saves a service desk profile.
     * 
     * @param userProfile The user profile to save.
     */
    async saveServiceDeskProfile(userProfile: ServiceDeskProfile): Promise<void> {
        const params = {
            TableName: 'service-desk-profile',
            Item: userProfile
        };

        await this.db.put(params).promise();
    }

    /**
     * Retrieves a first responder profile by their email.
     * 
     * @param email Gets a user profile by their email.
     * @returns The meeting if it exists.
     */
    async getServiceDeskProfile(email: string): Promise<ServiceDeskProfile> {
        const params: DocumentClient.GetItemInput = {
            TableName: 'service-desk-profile',
            Key: {
                "email": email
            }
        };
        const result = await this.db.get(params).promise();
        return result?.Item as ServiceDeskProfile;
    }

    /**
     * Retrieves all service desk profiles that match the provided search parameters.
     * 
     * @returns The service desk profiles.
     */
    async getServiceDeskProfiles(): Promise<ServiceDeskProfile[]> {
        const params: DocumentClient.QueryInput = {
            TableName: 'service-desk-profile',
        };

        const scanResults: ServiceDeskProfile[] = [];
        var items: DocumentClient.QueryOutput;
        do {
            items = await this.db.query(params).promise();
            items.Items?.forEach((item) => {
                const a = item as ServiceDeskProfile;
                scanResults.push(a);
            });
            params["ExclusiveStartKey"] = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey !== "undefined");

        return scanResults;
    }
}
