/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createMeetingDetail = /* GraphQL */ `
  mutation CreateMeetingDetail(
    $input: MeetingDetailInput!
    $condition: ModelMeetingDetailConditionInput
  ) {
    createMeetingDetail(input: $input, condition: $condition) {
      meetingId
      meetingStatus
      serviceDeskAttendee
      attendeeList
      createDateTime
      createdAt
      updatedAt
    }
  }
`;
export const updateMeetingDetail = /* GraphQL */ `
  mutation UpdateMeetingDetail(
    $input: MeetingDetailInput!
    $condition: ModelMeetingDetailConditionInput
  ) {
    updateMeetingDetail(input: $input, condition: $condition) {
      meetingId
      meetingStatus
      serviceDeskAttendee
      attendeeList
      createDateTime
      createdAt
      updatedAt
    }
  }
`;
export const deleteMeetingDetail = /* GraphQL */ `
  mutation DeleteMeetingDetail(
    $input: MeetingDetailInput!
    $condition: ModelMeetingDetailConditionInput
  ) {
    deleteMeetingDetail(input: $input, condition: $condition) {
      meetingId
      meetingStatus
      serviceDeskAttendee
      attendeeList
      createDateTime
      createdAt
      updatedAt
    }
  }
`;
