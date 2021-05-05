import AWS = require("aws-sdk");
import {
  Attendee,
  AttendeeJoinType,
  AttendeeState,
  AttendeeType,
  JoinDataType,
  LatLong,
  MeetingDetails,
  MeetingDetailsDao,
} from "./ddb/meeting-dao";
const { v4: uuidv4 } = require("uuid");

// The AWS Chime client is only available in select regions
const chime = new AWS.Chime({
  region: "us-east-1",
  endpoint: "service.chime.aws.amazon.com",
});
const db = new AWS.DynamoDB.DocumentClient({ region: "ca-central-1" });

// Handler for data initiated calls to create and join Chime meeting
//
export const handler = async (
  event: any = {},
  context: any,
  callback: any
): Promise<any> => {
  console.log(
    "Chime SDK CREATE invoked with call details:" + JSON.stringify(event)
  );

  let {
    phone_number,
    meeting_id,
    external_meeting_id,
    external_attendee_id,
    location,
    user_name,
    attendee_type,
  }: {
    phone_number: string;
    meeting_id: string;
    external_meeting_id?: string;
    external_attendee_id?: string;
    location?: LatLong;
    user_name?: string;
    attendee_type?: AttendeeType;
  } = event.arguments.input;

  const dao = new MeetingDetailsDao(db);
  let joinMeetingInfo: undefined | JoinDataType;
  let existingMeeting;
  console.log("Recieved preferred external meeting id: ", external_meeting_id);

  if (external_meeting_id)
    existingMeeting = await dao.getMeetingWithExternalMeetingId(
      external_meeting_id
    );
  if (existingMeeting) {
    console.log("found existing meeting id", existingMeeting.meeting_id);
    meeting_id = existingMeeting.meeting_id;
  } else {
    console.log(
      "Couldn't find meeting using external meeting id:",
      external_meeting_id
    );
  }

  if (!meeting_id) {
    // Create meeting and attendee
    //

    joinMeetingInfo = await newCall(
      meeting_id,
      phone_number,
      dao,
      external_meeting_id,
      external_attendee_id,
      location
    );
  } else {
    let meetingDetails = await dao.getMeetingWithMeetingId(meeting_id);
    console.log("Retrieved meeting details {}", JSON.stringify(meetingDetails));

    if (!meetingDetails) {
      // Create meeting and attendee
      //
      console.log("EXTERNAL_MEETING: ", external_meeting_id);

      joinMeetingInfo = await newCall(
        meeting_id,
        phone_number,
        dao,
        external_meeting_id,
        external_attendee_id,
        location
      );
    } else {
      // Add attendee to the existing call
      //
      joinMeetingInfo = await joinExistingCall(
        meetingDetails,
        phone_number,
        dao,
        external_attendee_id,
        user_name,
        attendee_type
      );
    }
  }

  console.log("Chime SDK join info:" + JSON.stringify(event));
  return joinMeetingInfo;
};

// Handles a new data initiated call by creating a new meeting with Chime and registering the meeting in DynamoDB.
//
async function newCall(
  callId: string,
  phone_number: string,
  dao: MeetingDetailsDao,
  preferredExternalMeetingId?: string,
  preferredExternalUserId?: string,
  location?: LatLong
) {
  console.log("Preferred External meeting id:", preferredExternalMeetingId);

  const externalMeetingId =
    preferredExternalMeetingId || (await dao.generateExternalMeetingId());
  const externalAttendeeId = preferredExternalUserId || uuidv4();
  const meetingResponse = await chime
    .createMeeting({
      ExternalMeetingId: externalMeetingId,
      ClientRequestToken: uuidv4(),
      MediaRegion: "ca-central-1", // Meetings should always be held in this region for data privacy restrictions
    })
    .promise();
  console.log("meeting response:" + JSON.stringify(meetingResponse));

  const meeting: AWS.Chime.Meeting = meetingResponse.Meeting!;
  const request: AWS.Chime.CreateAttendeeRequest = {
    MeetingId: meeting.MeetingId!,
    ExternalUserId: externalAttendeeId,
  };
  const attendeeResponse = await chime.createAttendee(request).promise();
  console.log("attendee details:" + JSON.stringify(attendeeResponse));

  if (attendeeResponse && attendeeResponse.Attendee?.AttendeeId) {
    // Registers the meeting in DDB
    //
    await dao.createNewMeeting(
      meeting.MeetingId!,
      phone_number,
      attendeeResponse.Attendee.AttendeeId,
      callId,
      externalMeetingId,
      AttendeeJoinType.DATA,
      AttendeeState.IN_CALL,
      location
    );

    const JoinMeetingInfo = {
      meeting_id: meetingResponse.Meeting?.MeetingId,
      attendee_id: attendeeResponse.Attendee?.AttendeeId,
      external_user_id: attendeeResponse.Attendee?.ExternalUserId,
      join_token: attendeeResponse.Attendee?.JoinToken,
      media_placement: meetingResponse?.Meeting?.MediaPlacement,
      media_region: meetingResponse?.Meeting?.MediaRegion,
    };

    return JoinMeetingInfo;
  } else {
    console.error(
      "Incorrect attendeeResponse for newCall : ",
      attendeeResponse
    );
  }
  throw new Error("error creating new call");

}

// Handles a new attendee joins an existing call by creating an attendee with Chime and add the attendee to the meeting in DynamoDB.
//
async function joinExistingCall(
  meetingDetails: MeetingDetails,
  phoneNumber: string,
  dao: MeetingDetailsDao,
  preferredExternalUserId?: string,
  userName?: string,
  attendeeType?: AttendeeType
) {
  console.log("Preferred External User id: ", preferredExternalUserId);

  const externalUserId = preferredExternalUserId || uuidv4();

  console.info("Adding new attendee %s to existing meeting", externalUserId);

  let meetingInfo, attendeeResponse;
  if (meetingDetails) {
    try {
      meetingInfo = await chime
        .getMeeting({
          MeetingId: meetingDetails.meeting_id,
        })
        .promise();
      console.log("Joining existing, valid chime meeting.");

      attendeeResponse = await chime
        .createAttendee({
          MeetingId: meetingDetails.meeting_id,
          ExternalUserId: externalUserId,
        })
        .promise();
      console.log("Attendee details:" + JSON.stringify(attendeeResponse));

      // Registers the new attendee in DDB
      //
      if (attendeeResponse && attendeeResponse.Attendee?.AttendeeId) {
        if (attendeeType === AttendeeType.SERVICE_DESK) {
          if (userName) {
            console.log(
              "Joining SERVICE_DESK attendeed %s to meeting",
              userName
            );
            await dao.addServiceDeskAttendee(
              meetingDetails,
              attendeeResponse.Attendee.AttendeeId,
              userName,
              AttendeeJoinType.DATA,
              AttendeeState.IN_CALL
            );
          } else {
            console.log(
              "Error : Attendee type is SERVICE_DESK but no username is provided."
            );
          }
        } else {
          await dao.addAttendeeByPhoneNumber(
            meetingDetails,
            attendeeResponse.Attendee.AttendeeId,
            phoneNumber,
            AttendeeJoinType.DATA,
            AttendeeState.IN_CALL
          );
        }

        const JoinMeetingInfo = {
          meeting_id: meetingDetails.meeting_id,
          attendee_id: attendeeResponse?.Attendee?.AttendeeId,
          external_user_id: attendeeResponse?.Attendee?.ExternalUserId,
          join_token: attendeeResponse?.Attendee?.JoinToken,
          media_placement: meetingInfo?.Meeting?.MediaPlacement,
          media_region: meetingInfo?.Meeting?.MediaRegion,
        };

        console.log(
          "JoinMeetingInfo details:" + JSON.stringify(JoinMeetingInfo)
        );
        return JoinMeetingInfo;
      } else {
        console.error(
          "Incorrect attendeeResponse for joinExistingCall : ",
          attendeeResponse
        );
      }
    } catch (e) {
      console.log("Found meeting, but chime has expired it", e);
    }
  }
  throw new Error("error joining existing call");
}

export async function generateExternalMeetingId(
  event: any = {},
  context: any,
  callback: any
) {
  const dao = new MeetingDetailsDao(db);
  return await dao.generateExternalMeetingId();
}
