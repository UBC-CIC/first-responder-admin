import { DocumentClient } from "aws-sdk/clients/dynamodb";

export type SpecialistProfile = {
    "email": string; // Email Address (e.g. "abc@amazon.com")
    "first_name": string; // First Name (e.g. "John")
    "last_name": string; // Last Name (e.g. "Doe")
    "phone_number": string; // Phone Number (e.g. "+16041111111")
    "user_role": string; // User Role (e.g. "Physician")
    "organization": string; // User Organization (e.g. "St. Mercy's Hospital")
    "profile_picture": string; // S3 link to the user profile picture (e.g. "s3://test-bucket/abc.jpg")
    "notes": string; // Any notes (e.g. "Specialist in Radiology.")
    "user_status": SpecialistStatus; // Indicates the current user availability - automatically updated every 30 minutes based on availability schedule.
    "call_status": SpecialistCallStatus; // Indicates whether the user is in a call or not.
    "availability": SpecialistAvailability; // Stores their availability schedule and overrides. 
    "created_date_time": string; // When this user was created (ISO8601 format)
    "updated_date_time": string; // When this user was updated (ISO8601 format)
    "location": GeolocationCoordinates;
};

export type GeolocationCoordinates = {
    "latitude": number;
    "longitude": number;
}

export type SpecialistAvalabilityOverride = {
    "start_time": string; // ISO8601 formatted time (e.g. "2020-01-04T00:23:00Z")
    "end_time": string; // ISO8601 formatted time (e.g. "2020-01-04T00:23:00Z")
    "override_type": SpecialistStatus;
};

export type SpecialistAvalabilitySchedule = {
    "day_of_week": number; // day of week can be 0-6, where 0 is Sunday, 1 is Monday, etc..
    "start_seconds_since_midnight": number; // e.g. 3660 = 01:01:00 since midnight
    "end_seconds_since_midnight": number; // e.g. 3660 = 01:01:00 since midnight
    "timezone": string; // the IANA formated timezone (e.g. "America/Vancouver")
    "availability_type": SpecialistStatus;
};

export type SpecialistAvailability = {
    "overrides": Array<SpecialistAvalabilityOverride>;
    "schedules": Array<SpecialistAvalabilitySchedule>;
};

export enum SpecialistStatus {
    AVAILABLE = "AVAILABLE", // User is available per their schedule
    NOT_AVAILABLE = "NOT_AVAILABLE", // User is not available per their schedule
    OFFLINE = "OFFLINE", // User has manually went offline
}

export enum SpecialistCallStatus {
    PAGED = "PAGED", // User has been paged but not joined the call
    IN_CALL = "IN_CALL", // User is in an active call
    NOT_IN_CALL = "NOT_IN_CALL", // User is not in a call
}

export enum AttendeeType {
    FIRST_RESPONDER,
    SPECIALIST,
    SERVICE_DESK,
    NOT_SPECIFIED,
}

export class SpecialistProfileDao {
    db: DocumentClient

    constructor(db: DocumentClient) {
        this.db = db;
    }

    /**
     * Create a specialist profile.
     * 
     * @param userProfile The user profile to save.
     */
    async createSpecialistProfile(userProfile: SpecialistProfile): Promise<Boolean> {
        const existingUserProfile = await this.getSpecialistProfile(userProfile.phone_number);
        if (existingUserProfile) {
            // If any existing user profile exists, we should not attempt to create a new profile.
            return false;
        }

        userProfile.created_date_time = new Date().toISOString();
        userProfile.user_status = this.getUpdatedUserStatus(userProfile);

        const params = {
            TableName: 'specialist-profile',
            Item: userProfile
        };
        await this.db.put(params).promise();
        return true;
    }

    /**
     * Change the user status manually.
     * 
     * @param phoneNumber The user phone number
     * @param newStatus The new status to use. If not provided, the user status is automatically calculated.
     */
    async updateUserStatus(phoneNumber: string, newStatus?: SpecialistStatus): Promise<Boolean> {
        console.log(`Updating user status for phone number ${phoneNumber}`);
        const userProfile = await this.getSpecialistProfile(phoneNumber);
        userProfile.created_date_time = new Date().toISOString();
        if (newStatus) {
            userProfile.user_status = newStatus;
        } else {
            userProfile.user_status = this.getUpdatedUserStatus(userProfile);
        }
        await this.saveSpecialistProfile(userProfile);
        return true;
    }

    /**
     * Saves a user profile.
     * 
     * @param userProfile The user profile to save.
     */
    async saveSpecialistProfile(userProfile: SpecialistProfile): Promise<void> {
        console.log(`saveSpecialistProfile...`);
        const params = {
            TableName: 'specialist-profile',
            Item: userProfile
        };

        userProfile.updated_date_time = new Date().toISOString();

        await this.db.put(params).promise();
    }

    /**
     * Retrieves a user profile by their phone number.
     * 
     * @param phoneNumber Gets a user profile by their phone number address.
     * @returns The meeting if it exists.
     */
    async getSpecialistProfile(phoneNumber: string): Promise<SpecialistProfile> {
        const params: DocumentClient.GetItemInput = {
            TableName: 'specialist-profile',
            Key: {
                "phone_number": phoneNumber
            }
        };
        const result = await this.db.get(params).promise();
        return result?.Item as SpecialistProfile;
    }

    /**
     * Updates a specialist call status.
     * 
     * @param phoneNumber The phone number of the specialist
     * @param callStatus The new call status of the specialist
     */
    async updateSpecialistCallStatus(phoneNumber: string, callStatus: SpecialistCallStatus): Promise<void> {
        console.log(`Getting specialist call status for ${phoneNumber}`);
        const specialistProfile = await this.getSpecialistProfile(phoneNumber);
        if (specialistProfile) {
            console.log(`Specialist profile found ${phoneNumber}`);
            specialistProfile.call_status = callStatus;
        }
        await this.saveSpecialistProfile(specialistProfile);
    }

    /**
     * Retrieves all user profiles that match the provided search parameters.
     * 
     * @param userStatus The user status
     * @returns The meeting if it exists, null otherwise.
     */
    async getSpecialists(userStatus: SpecialistStatus): Promise<SpecialistProfile[]> {
        const params: DocumentClient.QueryInput = {
            TableName: 'specialist-profile',
            IndexName: 'userStatusGsi',
            KeyConditionExpression: 'user_status = :hkey',
            ExpressionAttributeValues: {
                ':hkey': userStatus.toString(),
            }
        };

        const scanResults: SpecialistProfile[] = [];
        var items: DocumentClient.QueryOutput;
        do {
            items = await this.db.query(params).promise();
            items.Items?.forEach((item) => {
                const a = item as SpecialistProfile;
                scanResults.push(a);
            });
            params["ExclusiveStartKey"] = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey !== "undefined");

        return scanResults;
    }

    /**
     * Updates the status of each user, seeing if they are available of not based on their schedule.
     * 
     * @param userStatus The user status
     * @returns The meeting if it exists, null otherwise.
     */
    async updateUserStatusBasedOnAvailability(): Promise<SpecialistProfile[]> {
        const params: DocumentClient.ScanInput = {
            TableName: 'specialist-profile'
        };

        const scanResults: SpecialistProfile[] = [];
        var items: DocumentClient.ScanOutput;
        do {
            items = await this.db.scan(params).promise();
            if (items.Items) {
                for (let item of items.Items) {
                    const a = item as unknown as SpecialistProfile;
                    if (a.user_status !== SpecialistStatus.AVAILABLE && a.user_status !== SpecialistStatus.NOT_AVAILABLE) {
                        // If the user is not one of these two statuses, they must have 
                        // manually switched to a another status. We don't touch these other 
                        // manually configured status.
                        console.log(`Not changing user status of ${a.phone_number} because this user status had been manually updated.`)
                    } else {
                        const updatedUserStatus = this.getUpdatedUserStatus(a);
                        if (updatedUserStatus !== a.user_status) {
                            console.log(`User ${a.phone_number} has changed availability from ${a.user_status} to ${updatedUserStatus}`);
                            a.user_status = updatedUserStatus;
                            await this.saveSpecialistProfile(a);
                        }
                    }
                }
            }
            params["ExclusiveStartKey"] = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey !== "undefined");

        return scanResults;
    }

    private getUpdatedUserStatus(userProfile: SpecialistProfile): SpecialistStatus {
        const currTime = new Date();
        const currDayOfWeek = currTime.getDay();

        if (userProfile.availability) {
            // Are there any datetime overrides to consider for this user?
            //
            for (let override of userProfile.availability.overrides) {
                const overrideStartTime = new Date(override.start_time);
                const overrideEndTime = new Date(override.end_time);
                if (currTime.getTime() >= overrideStartTime.getTime() && currTime.getTime() < overrideEndTime.getTime()) {
                    // Override found so we will take this override no matter what
                    return override.override_type;
                }
            }

            // Let's look at the recurring schedule
            //
            for (let schedule of userProfile.availability.schedules) {
                const dayOfWeek = schedule.day_of_week;
                if (dayOfWeek !== currDayOfWeek) {
                    // If the day of week doesn't match then this rule doesn't match
                    continue;
                }

                // Notes on timezones:
                // - If a user in Vancouver signs up for Mondays between 7pm-9pm slot during PST, and the service
                //   desk is in Calgary, then the service desk attendant should only see that this person is available
                //   on Mondays between 8pm-10pm in MST. 
                // - During Daylight Savings time switches, the same time should be carried over. For instance, the same 
                //   7pm-9pm slot automatically should be applied under PDT instead of PST.
                // 
                const currLocalizedHour = new Date(new Date().toLocaleString("en-US", {timeZone: schedule.timezone})).getHours();
                const currLocalizedMinute = new Date(new Date().toLocaleString("en-US", {timeZone: schedule.timezone})).getMinutes();
                const currLocalizedSecond = new Date(new Date().toLocaleString("en-US", {timeZone: schedule.timezone})).getSeconds();
                const currSecondsSinceMidnight = currLocalizedHour * 3600 + currLocalizedMinute * 60 + currLocalizedSecond;

                if (currSecondsSinceMidnight >= schedule.start_seconds_since_midnight && currSecondsSinceMidnight < schedule.end_seconds_since_midnight) {
                    return schedule.availability_type;
                }
            }
        }

        return SpecialistStatus.NOT_AVAILABLE;
    }
}
