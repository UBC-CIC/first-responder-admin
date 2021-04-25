import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { FirstResponderProfileDao } from "./first-responder-profile-dao";
import { ServiceDeskProfileDao } from "./service-desk-profile-dao";
import { SpecialistProfileDao } from "./specialist-profile-dao";

const DEFAULT_ORGANIZATION = "STARS";

type Attendee = {
    "phone_number": string;
    "attendee_id": string;
    "attendee_type"?: AttendeeType;
    "attendee_join_type"?: AttendeeJoinType;
    "attendee_state"?: AttendeeState;
    "user_role"?: string; // If applicable, denotes the specific type of user (e.g. cardiologist, safety supervisor)
    "organization"?: string;
    "first_name"?: string;
    "last_name"?: string;
    "username"?: string;
};

export type MeetingDetails = {
    "meeting_id": string;
    "attendees": Array<Attendee>;
    "create_date_time": string;
    "end_date_time"?: string;
    "call_id": string;
    "external_meeting_id": string;
    "meeting_status": string;
    "meeting_comments": string;
};

export enum MeetingStatus {
    ACTIVE = "ACTIVE",
    CLOSED = "CLOSED",
}

export enum AttendeeJoinType {
    PSTN = "PSTN",
    DATA = "DATA",
}

export enum AttendeeState {
    PAGED = "PAGED",
    IN_CALL = "IN_CALL",
    LEFT = "LEFT",
    KICKED = "KICKED",
}

export enum AttendeeType {
    FIRST_RESPONDER = "FIRST_RESPONDER",
    SPECIALIST = "SPECIALIST",
    SERVICE_DESK = "SERVICE_DESK",
    NOT_SPECIFIED = "NOT_SPECIFIED",
}

export class MeetingDetailsDao {
    db: DocumentClient

    constructor(db: DocumentClient) {
        this.db = db;
    }

    /**
     * Registers a new meeting in DynamoDB, returning a new user-friendly external meeting ID that can be used to 
     * join the meeting through PSTN in the future.
     * 
     * @param meetingId The meeting ID.
     * @param phoneNumber The phone number the call is associated with.
     * @param attendeeId The attendee ID.
     * @param callId The call ID.
     * @param externalMeetingId The user-friendly meeting ID that users can use to dial in with.
     * @param attendeeJoinType Did the user join by data or PSTN?
     * @param attendeeState Is the user paged? in the call?
     */
    async createNewMeeting(meetingId: string, phoneNumber: string, attendeeId: string, callId: string, 
                           externalMeetingId: string, attendeeJoinType: AttendeeJoinType, attendeeState: AttendeeState): Promise<void> {

        const attendee = await this.getAttendeeForMeetingByPhoneNumber(attendeeId, phoneNumber, attendeeJoinType, attendeeState);
        const meetingObj: MeetingDetails = {
            "meeting_id": meetingId,
            "attendees": [attendee],
            "create_date_time": new Date().toISOString(),
            "call_id": callId,
            "external_meeting_id": externalMeetingId,
            "meeting_status": MeetingStatus.ACTIVE.toString(),
            "meeting_comments": "",
        };
        const params = {
            TableName: 'meeting-detail',
            Item: meetingObj
        };
        // Consider using a conditional write in the future to prevent overlapping external meeting IDs.
        await this.db.put(params).promise();
    }

    /**
     * Add attendee by updating meeting details attendee list with new attendee. If an existing attendee is found with the 
     * same phone number, we will update the existing attendee.
     * 
     * @param meetingDetails details of the meeting to be added attendee to
     * @param attendeeId     id of the new attendee to be added
     * @param phoneNumber    phone number of the new attendee to be added
     * @param attendeeJoinType Did the user join by data or PSTN?
     * @param attendeeState Is the user paged? in the call?
     */
    async addAttendeeByPhoneNumber(meetingDetails: MeetingDetails, attendeeId: string, phoneNumber: string, 
                      attendeeJoinType: AttendeeJoinType, attendeeState: AttendeeState): Promise<void> {
        
        console.log("addAttendeeByPhoneNumber for attendeeId: %s, phoneNumber: %s", attendeeId, phoneNumber)
        let existingAttendee = null;
        for (let attendee of meetingDetails.attendees) {
            if (attendee.phone_number === phoneNumber) {
                existingAttendee = attendee;
                console.log("attendee already exists in the meeting")
                break;
            }
        }
        if (existingAttendee) {
            // Updates an existing attendee.
            existingAttendee.attendee_state = attendeeState;
            existingAttendee.attendee_join_type = attendeeJoinType;
            existingAttendee.attendee_id = attendeeId;
        } else {
            // Adds a new attendee.
            const attendee = await this.getAttendeeForMeetingByPhoneNumber(attendeeId, phoneNumber, attendeeJoinType, attendeeState);
            meetingDetails.attendees.push(attendee);
        }
        await this.saveMeetingDetails(meetingDetails);  
    }

    /**
     * Add attendee by updating meeting details attendee list with new attendee. If an existing attendee is found with the 
     * same username, we will update the existing attendee. This is intended to be used when the service desk joins.
     * 
     * @param meetingDetails details of the meeting to be added attendee to
     * @param attendeeId     id of the new attendee to be added
     * @param username    username of the new attendee to be added
     * @param attendeeJoinType Did the user join by data or PSTN?
     * @param attendeeState Is the user paged? in the call?
     */
    async addServiceDeskAttendee(meetingDetails: MeetingDetails, attendeeId: string, username: string, 
                      attendeeJoinType: AttendeeJoinType, attendeeState: AttendeeState): Promise<void> {

        let existingAttendee = null;
        for (let attendee of meetingDetails.attendees) {
            if (attendee.username === username) {
                existingAttendee = attendee;
                break;
            }
        }
        if (existingAttendee) {
            // Updates an existing attendee.
            existingAttendee.attendee_state = attendeeState;
            existingAttendee.attendee_join_type = attendeeJoinType;
            existingAttendee.attendee_id = attendeeId;
        } else {
            // Adds a new attendee.
            const serviceDeskDao = new ServiceDeskProfileDao(this.db);
            const serviceDeskProfile = await serviceDeskDao.getServiceDeskProfile(username);
            const firstName = serviceDeskProfile.name.split(" ")[0];
            const lastName = serviceDeskProfile.name.split(" ").length > 1 ? serviceDeskProfile.name.split(" ")[1] : "";
            const attendee: Attendee = {
                "attendee_id": attendeeId,
                "phone_number": serviceDeskProfile.phone_number,
                "attendee_type": AttendeeType.SERVICE_DESK,
                "attendee_join_type": attendeeJoinType,
                "attendee_state": attendeeState,
                "first_name": firstName,
                "last_name": lastName,
                "user_role": "",
                "organization": DEFAULT_ORGANIZATION,
                "username": username,
            }
            meetingDetails.attendees.push(attendee);
        }
        await this.saveMeetingDetails(meetingDetails);  
    }

    /**
     * Retrieves the attendee information based on their phone number
     * @param attendeeId Attendee ID
     * @param phoneNumber Phone number of the new attendee to be added
     * @param attendeeJoinType Did the user join by data or PSTN?
     * @returns the attendee
     */
    async getAttendeeForMeetingByPhoneNumber(attendeeId: string, phoneNumber: string, attendeeJoinType: AttendeeJoinType, attendeeState: AttendeeState): Promise<Attendee> {
        console.log("getAttendeeForMeetingByPhoneNumber for attendeeId: %s, phoneNumber: %s, attendeeJoinType: %s, attendeeState: %s", attendeeId, phoneNumber, attendeeJoinType, attendeeState);

        const specialistDao = new SpecialistProfileDao(this.db);
        const specialistProfile = await specialistDao.getSpecialistProfile(phoneNumber);
        let firstName = "";
        let lastName = "";
        let userRole = "";
        let organization = "";
        let username = "";
        let attendeeType = AttendeeType.NOT_SPECIFIED;
        if (specialistProfile) {
            console.log(`User with phone number ${phoneNumber} is a specialist`);
            firstName = specialistProfile.first_name;
            lastName = specialistProfile.last_name;
            userRole = specialistProfile.user_role;
            organization = specialistProfile.organization;
            attendeeType = AttendeeType.SPECIALIST;
        } else {
            const firstResponderDao = new FirstResponderProfileDao(this.db);
            const firstResponderProfile = await firstResponderDao.getFirstResponderProfile(phoneNumber);
            if (firstResponderProfile) {
                console.log(`User with phone number ${phoneNumber} is a first responder`);
                firstName = firstResponderProfile.first_name;
                lastName = firstResponderProfile.last_name;
                userRole = firstResponderProfile.occupation;
                organization = firstResponderProfile.organization;
                attendeeType = AttendeeType.FIRST_RESPONDER;
            }
        }

        const attendee: Attendee = {
            "attendee_id": attendeeId,
            "phone_number": phoneNumber,
            "attendee_type": attendeeType,
            "attendee_join_type": attendeeJoinType,
            "attendee_state": attendeeState,
            "first_name": firstName,
            "last_name": lastName,
            "user_role": userRole,
            "organization": organization,
            "username": username,
        }
        return attendee;
    }

    /**
     * Updates the attendee state to indicate that the user has left the call.
     * @param meetingId the Chime meeting ID
     * @param meetingId the Chime attendee ID
     */
    async attendeeLeft(meetingId: string, attendeeId: string): Promise<void> {
        const existingMeeting = await this.getMeetingWithMeetingId(meetingId);
        if (existingMeeting) {
            console.log(`Updating existing meeting with meeting ID ${meetingId}`);
            for (let attendee of existingMeeting.attendees) {
                if (attendee.attendee_id === attendeeId) {
                    attendee.attendee_state = AttendeeState.LEFT;
                }
                await this.saveMeetingDetails(existingMeeting);
            }
        }
    }

    /**
     * Ends a meeting by updating its status in the DDB table.
     * @param meetingId The Chime meeting ID.
     */
    async endMeeting(meetingId: string): Promise<void> {
        const existingMeeting = await this.getMeetingWithMeetingId(meetingId);
        if (existingMeeting) {
            console.log(`Closing existing meeting with meeting ID ${meetingId}`);
            existingMeeting.meeting_status = MeetingStatus.CLOSED.toString();
            existingMeeting.end_date_time = new Date().toISOString();
            await this.saveMeetingDetails(existingMeeting);
        }
    }

    /**
     * Gets an existing active meeting based on the user phone number. If there is a Chime meeting in the
     * database but the Chime meeting no longer exists, 
     * 
     * @param fromNumber The user phone number.
     * @returns The meeting details or null if no matching meeting found.
     */
    async getExistingMeetingWithPhoneNumber(fromNumber: string): Promise<MeetingDetails | null> {
        const activeMeetings = await this.getActiveMeetings();
        for (var activeMeeting of activeMeetings) {
            if (activeMeeting.attendees) {
                for (var attendee of activeMeeting.attendees) {
                    if (attendee.phone_number == fromNumber) {
                        return activeMeeting;
                    }
                }
            }
        }
        return null;
    }

    /**
     * Saves a new meeting detail.
     * 
     * @param meetingDetails The updated meeting details.
     */
    async saveMeetingDetails(meetingDetails: MeetingDetails): Promise<void> {
        const params = {
            TableName: 'meeting-detail',
            Item: meetingDetails
        };
        await this.db.put(params).promise();
    }

    /**
     * Retrieves a meeting with the UUID
     * 
     * @param meetingId The meeting ID (UUID format)
     * @returns The meeting if it exists.
     */
    async getMeetingWithMeetingId(meetingId: string): Promise<MeetingDetails> {
        const params: DocumentClient.GetItemInput = {
            TableName: 'meeting-detail',
            Key: {
                "meeting_id": meetingId
            }
        };
        // Consider using a conditional write in the future to prevent overlapping external meeting IDs.
        const result = await this.db.get(params).promise();
        return result?.Item as MeetingDetails;
    }

    /**
     * Retrieves a meeting with the user-friendly digit format.
     * 
     * @param externalMeetingId The external meeting ID (digit-format)
     * @returns The meeting if it exists, null otherwise.
     */
    async getMeetingWithExternalMeetingId(externalMeetingId: string): Promise<MeetingDetails | null> {
        // Note: While we could create another GSI for the external meeting ID, this method is 
        // useful to avoid creating multiple GSIs which could complicate deployments.
        const activeMeetings = await this.getActiveMeetings();

        for (var activeMeeting of activeMeetings) {
            if (activeMeeting.external_meeting_id == externalMeetingId) {
                return activeMeeting;
            }
        }
        return null;
    }

    /**
     * Gets a list of active, ongoing meetings.
     */
    async getActiveMeetings(): Promise<MeetingDetails[]> {
        const params: DocumentClient.QueryInput = {
            TableName: 'meeting-detail',
            IndexName: 'meetingStatusGsi',
            KeyConditionExpression: 'meeting_status = :hkey',
            ExpressionAttributeValues: {
                ':hkey': MeetingStatus.ACTIVE.toString(),
            }
        };

        const scanResults: MeetingDetails[] = [];
        var items: DocumentClient.QueryOutput;
        do {
            items = await this.db.query(params).promise();
            items.Items?.forEach((item) => scanResults.push(item as MeetingDetails));
            params["ExclusiveStartKey"] = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey !== "undefined");

        return scanResults;
    }

    /**
     * Generates a random eight-digit meeting ID that is guaranteed to not be associated with any previous meeting.
     */
    async generateExternalMeetingId(): Promise<string> {
        var i = 0;
        while (true) {
            const externalMeetingId = String(Math.floor(10000000 + Math.random() * 90000000));
            console.log(`Generated external meeting ID ${externalMeetingId}`);
            
            const activeMeetings = await this.getActiveMeetings();
            var idValid = true;
            for (var activeMeeting of activeMeetings) {
                if (activeMeeting.external_meeting_id === externalMeetingId) {
                    // We have a duplicate external meeting ID (should happen 
                    // extremely rarely).
                    console.warn(`External meeting ID ${externalMeetingId} already used by an active meeting!`);
                    idValid = false;
                }
            }

            if (idValid) {
                return externalMeetingId;
            }

            i++;
            if (i > 100) {
                console.error(`Breaking out of loop because max iterations exceeded...`);
                throw new Error("Too many iterations of external meeting ID");
            }
        }
    }
}
