/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createMeetingDetail = /* GraphQL */ `
  mutation CreateMeetingDetail(
    $input: MeetingDetailInput
    $condition: ModelMeetingDetailConditionInput
  ) {
    createMeetingDetail(input: $input, condition: $condition) {
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
export const updateMeetingDetail = /* GraphQL */ `
  mutation UpdateMeetingDetail(
    $input: MeetingDetailInput
    $condition: ModelMeetingDetailConditionInput
  ) {
    updateMeetingDetail(input: $input, condition: $condition) {
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
export const deleteMeetingDetail = /* GraphQL */ `
  mutation DeleteMeetingDetail(
    $input: MeetingDetailInput
    $condition: ModelMeetingDetailConditionInput
  ) {
    deleteMeetingDetail(input: $input, condition: $condition) {
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
export const publishMeetingDetailUpdates = /* GraphQL */ `
  mutation PublishMeetingDetailUpdates($meetingDetail: MeetingDetailInput!) {
    publishMeetingDetailUpdates(meetingDetail: $meetingDetail) {
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
