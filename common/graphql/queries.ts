/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMeetingDetail = /* GraphQL */ `
  query GetMeetingDetail($meetingId: String!) {
    getMeetingDetail(meetingId: $meetingId) {
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
export const listMeetingDetails = /* GraphQL */ `
  query ListMeetingDetails(
    $filter: ModelMeetingDetailFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMeetingDetails(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        meetingId
        meetingStatus
        serviceDeskAttendee
        attendeeList
        createDateTime
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
