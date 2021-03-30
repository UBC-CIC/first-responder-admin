/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMeetingDetail = /* GraphQL */ `
  query GetMeetingDetail($meetingId: String!) {
    getMeetingDetail(meetingId: $meetingId) {
      meeting_id
      attendees {
        phone_number
        attendee_id
        attendee_type
        attendee_join_type
      }
      create_date_time
      end_date_time
      call_id
      external_meeting_id
      meeting_status
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
        attendees {
          phone_number
          attendee_id
          attendee_type
          attendee_join_type
        }
        create_date_time
        end_date_time
        call_id
        external_meeting_id
        meeting_status
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
        attendees {
          phone_number
          attendee_id
          attendee_type
          attendee_join_type
        }
        create_date_time
        end_date_time
        call_id
        external_meeting_id
        meeting_status
      }
      nextToken
    }
  }
`;
export const getMeetingDetailsByStatusAndCreateTime = /* GraphQL */ `
  query GetMeetingDetailsByStatusAndCreateTime(
    $meetingStatus: String!
    $startTime: String!
    $endTime: String!
    $limit: Int
    $nextToken: String
  ) {
    getMeetingDetailsByStatusAndCreateTime(
      meetingStatus: $meetingStatus
      startTime: $startTime
      endTime: $endTime
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        meeting_id
        attendees {
          phone_number
          attendee_id
          attendee_type
          attendee_join_type
        }
        create_date_time
        end_date_time
        call_id
        external_meeting_id
        meeting_status
      }
      nextToken
    }
  }
`;
