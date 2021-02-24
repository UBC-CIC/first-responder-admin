/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMeetingDetails = /* GraphQL */ `
  query GetMeetingDetails($id: ID!) {
    getMeetingDetails(id: $id) {
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
export const listMeetingDetailss = /* GraphQL */ `
  query ListMeetingDetailss(
    $filter: ModelMeetingDetailsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMeetingDetailss(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        meetingId
        status
        service_desk_attendee
        attendeeList
        createDateTime
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
