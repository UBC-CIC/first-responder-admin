/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createSpecialistProfile = /* GraphQL */ `
  mutation CreateSpecialistProfile($input: SpecialistProfileInput!) {
    createSpecialistProfile(input: $input) {
      email
      first_name
      last_name
      phone_number
      user_role
      organization
      profile_picture
      notes
      user_status
      is_paged
      availability {
        overrides {
          start_time
          end_time
          override_type
        }
        schedules {
          start_time
          end_time
          override_type
        }
      }
      created_date_time
      updated_date_time
    }
  }
`;
export const updateSpecialistProfile = /* GraphQL */ `
  mutation UpdateSpecialistProfile($input: SpecialistProfileInput!) {
    updateSpecialistProfile(input: $input) {
      email
      first_name
      last_name
      phone_number
      user_role
      organization
      profile_picture
      notes
      user_status
      is_paged
      availability {
        overrides {
          start_time
          end_time
          override_type
        }
        schedules {
          start_time
          end_time
          override_type
        }
      }
      created_date_time
      updated_date_time
    }
  }
`;
export const deleteSpecialistProfile = /* GraphQL */ `
  mutation DeleteSpecialistProfile($input: SpecialistProfileInput!) {
    deleteSpecialistProfile(input: $input) {
      email
      first_name
      last_name
      phone_number
      user_role
      organization
      profile_picture
      notes
      user_status
      is_paged
      availability {
        overrides {
          start_time
          end_time
          override_type
        }
        schedules {
          start_time
          end_time
          override_type
        }
      }
      created_date_time
      updated_date_time
    }
  }
`;
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
        user_role
        organization
        first_name
        last_name
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
        user_role
        organization
        first_name
        last_name
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
        user_role
        organization
        first_name
        last_name
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
  mutation PublishMeetingDetailUpdates($input: MeetingDetailInput!) {
    publishMeetingDetailUpdates(input: $input) {
      meeting_id
      attendees {
        phone_number
        attendee_id
        attendee_type
        attendee_join_type
        user_role
        organization
        first_name
        last_name
      }
      create_date_time
      end_date_time
      call_id
      external_meeting_id
      meeting_status
    }
  }
`;
