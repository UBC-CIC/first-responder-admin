/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMeetingDetail = /* GraphQL */ `
  query GetMeetingDetail($meetingId: String!) {
    getMeetingDetail(meetingId: $meetingId) {
      meeting_id
      meeting_status
      service_desk_attendee
      attendee_list
      create_date_time
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
        meeting_id
        meeting_status
        service_desk_attendee
        attendee_list
        create_date_time
      }
      nextToken
    }
  }
`;
export const getMeetingDetailsByStatus = /* GraphQL */ `
  query GetMeetingDetailsByStatus(
    $meetingStatus: String!
    $limit: Int
    $nextToken: String
  ) {
    getMeetingDetailsByStatus(
      meetingStatus: $meetingStatus
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        meeting_id
        meeting_status
        service_desk_attendee
        attendee_list
        create_date_time
      }
      nextToken
    }
  }
`;
