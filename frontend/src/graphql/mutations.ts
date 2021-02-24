/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createMeetingDetails = /* GraphQL */ `
  mutation CreateMeetingDetails(
    $input: CreateMeetingDetailsInput!
    $condition: ModelMeetingDetailsConditionInput
  ) {
    createMeetingDetails(input: $input, condition: $condition) {
      id
      meetingId
      status
      service_desk_attendee
      attendeeList
      createDateTime
      createdAt
      updatedAt
    }
  }
`;
export const updateMeetingDetails = /* GraphQL */ `
  mutation UpdateMeetingDetails(
    $input: UpdateMeetingDetailsInput!
    $condition: ModelMeetingDetailsConditionInput
  ) {
    updateMeetingDetails(input: $input, condition: $condition) {
      id
      meetingId
      status
      service_desk_attendee
      attendeeList
      createDateTime
      createdAt
      updatedAt
    }
  }
`;
export const deleteMeetingDetails = /* GraphQL */ `
  mutation DeleteMeetingDetails(
    $input: DeleteMeetingDetailsInput!
    $condition: ModelMeetingDetailsConditionInput
  ) {
    deleteMeetingDetails(input: $input, condition: $condition) {
      id
      meetingId
      status
      service_desk_attendee
      attendeeList
      createDateTime
      createdAt
      updatedAt
    }
  }
`;
