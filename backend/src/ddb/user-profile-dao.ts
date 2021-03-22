import { DocumentClient } from "aws-sdk/clients/dynamodb";

export type UserProfile = {
    "email": string; // Email Address (e.g. "abc@amazon.com")
    "first_name": string; // First Name (e.g. "John")
    "last_name": string; // Last Name (e.g. "Doe")
    "phone_number": string; // Phone Number (e.g. "+16041111111")
    "user_role": string; // User Role (e.g. "Physician")
    "organization": string; // User Organization (e.g. "St. Mercy's Hospital")
    "profile_picture": string; // S3 link to the user profile picture (e.g. "s3://test-bucket/abc.jpg")
    "notes": string; // Any notes (e.g. "Specialist in Radiology.")
    "user_status": UserStatus; // Indicates whether any actions have been taken on behalf of this user.
    "is_paged": boolean,
    "availability": UserAvailability; // Stores their availability schedule and overrides. 
    "created_date_time": string; // When this user was created (ISO8601 format)
    "updated_date_time": string; // When this user was updated (ISO8601 format)
};

export type UserAvalabilityOverride = {
    "start_time": string; // ISO8601 formatted time (e.g. "2020-01-04T00:23:00Z")
    "end_time": string; // ISO8601 formatted time (e.g. "2020-01-04T00:23:00Z")
    "override_type": UserStatus;
};

export type UserAvalabilitySchedule = {
    "day_of_week": number; // day of week can be 0-6, where 0 is Sunday, 1 is Monday, etc..
    "start_seconds_since_midnight": number; // e.g. 3660 = 01:01:00 since midnight
    "end_seconds_since_midnight": number; // e.g. 3660 = 01:01:00 since midnight
    "timezone": string, // the IANA formated timezone (e.g. "America/Vancouver")
    "availability_type": UserStatus;
};

export type UserAvailability = {
    "overrides": Array<UserAvalabilityOverride>;
    "schedules": Array<UserAvalabilitySchedule>;
};

export enum UserStatus {
    AVAILABLE = "AVAILABLE", // User is available per their schedule
    NOT_AVAILABLE = "NOT_AVAILABLE", // User is not available per their schedule
    OFFLINE = "OFFLINE", // User has manually went offline
}

export class UserProfileDao {
    db: DocumentClient

    constructor(db: DocumentClient) {
        this.db = db;
    }

    /**
     * Create a user profile.
     * 
     * @param userProfile The user profile to save.
     */
    async createUserProfile(userProfile: UserProfile): Promise<Boolean> {
        const existingUserProfile = await this.getUserProfile(userProfile.email);
        if (existingUserProfile) {
            // If any existing user profile exists, we should not attempt to create a new profile.
            return false;
        }

        userProfile.created_date_time = new Date().toISOString();
        userProfile.user_status = this.getUpdatedUserStatus(userProfile);

        const params = {
            TableName: 'user-profile',
            Item: userProfile
        };
        await this.db.put(params).promise();
        return true;
    }

    /**
     * Change the user status manually.
     * 
     * @param email The user email
     * @param newStatus The new status to use. If not provided, the user status is automatically calculated.
     */
    async updateUserStatus(email: string, newStatus?: UserStatus): Promise<Boolean> {
        const userProfile = await this.getUserProfile(email);
        userProfile.created_date_time = new Date().toISOString();
        if (newStatus) {
            userProfile.user_status = newStatus;
        } else {
            userProfile.user_status = this.getUpdatedUserStatus(userProfile);
        }

        const params = {
            TableName: 'user-profile',
            Item: userProfile
        };
        await this.db.put(params).promise();
        return true;
    }

    /**
     * Saves a user profile.
     * 
     * @param userProfile The user profile to save.
     */
    async saveUserProfile(userProfile: UserProfile): Promise<void> {
        const params = {
            TableName: 'user-profile',
            Item: userProfile
        };

        userProfile.updated_date_time = new Date().toISOString();

        await this.db.put(params).promise();
    }

    /**
     * Retrieves a user profile by their email.
     * 
     * @param email Gets a user profile by their email address.
     * @returns The meeting if it exists.
     */
    async getUserProfile(email: string): Promise<UserProfile> {
        const params: DocumentClient.GetItemInput = {
            TableName: 'user-profile',
            Key: {
                "email": email
            }
        };
        const result = await this.db.get(params).promise();
        return result?.Item as UserProfile;
    }

    /**
     * Retrieves all user profiles that match the provided search parameters.
     * 
     * @param userStatus The user status
     * @returns The meeting if it exists, null otherwise.
     */
    async getUsers(userStatus: UserStatus): Promise<UserProfile[]> {
        const params: DocumentClient.QueryInput = {
            TableName: 'user-profile',
            IndexName: 'userStatusGsi',
            KeyConditionExpression: 'user_status = :hkey',
            ExpressionAttributeValues: {
                ':hkey': userStatus.toString(),
            }
        };

        const scanResults: UserProfile[] = [];
        var items: DocumentClient.QueryOutput;
        do {
            items = await this.db.query(params).promise();
            items.Items?.forEach((item) => {
                const a = item as UserProfile;
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
    async updateUserStatusBasedOnAvailability(): Promise<UserProfile[]> {
        const params: DocumentClient.ScanInput = {
            TableName: 'user-profile'
        };

        const scanResults: UserProfile[] = [];
        var items: DocumentClient.ScanOutput;
        do {
            items = await this.db.scan(params).promise();
            if (items.Items) {
                for (let item of items.Items) {
                    const a = item as unknown as UserProfile;
                    if (a.user_status !== UserStatus.AVAILABLE && a.user_status !== UserStatus.NOT_AVAILABLE) {
                        // If the user is not one of these two statuses, they must have 
                        // manually switched to a another status. We don't touch these other 
                        // manually configured status.
                        console.log(`Not changing user status of ${a.email} because this user status had been manually updated.`)
                    } else {
                        const updatedUserStatus = this.getUpdatedUserStatus(a);
                        if (updatedUserStatus !== a.user_status) {
                            console.log(`User ${a.email} has changed availability from ${a.user_status} to ${updatedUserStatus}`);
                            a.user_status = updatedUserStatus;
                            await this.saveUserProfile(a);
                        }
                    }
                }
            }
            params["ExclusiveStartKey"] = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey !== "undefined");

        return scanResults;
    }

    private getUpdatedUserStatus(userProfile: UserProfile): UserStatus {
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

        return UserStatus.NOT_AVAILABLE;
    }
}
