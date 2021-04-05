/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type MeetingDetailInput = {
  meeting_id: string,
  attendees?: Array< AttendeeInput | null > | null,
  create_date_time?: string | null,
  end_date_time?: string | null,
  call_id?: string | null,
  external_meeting_id?: string | null,
  meeting_status?: string | null,
};

export type AttendeeInput = {
  phone_number?: string | null,
  attendee_id?: string | null,
  attendee_type?: AttendeeType | null,
  attendee_join_type?: AttendeeJoinType | null,
};

export enum AttendeeType {
  FIRST_RESPONDER = "FIRST_RESPONDER",
  SPECIALIST = "SPECIALIST",
  SERVICE_DESK = "SERVICE_DESK",
  NOT_SPECIFIED = "NOT_SPECIFIED",
}


export enum AttendeeJoinType {
  PSTN = "PSTN",
  DATA = "DATA",
}


export type ModelMeetingDetailConditionInput = {
  attendees?: ModelStringInput | null,
  create_date_time?: ModelStringInput | null,
  end_date_time?: string | null,
  call_id?: ModelStringInput | null,
  external_meeting_id?: ModelStringInput | null,
  meeting_status?: ModelStringInput | null,
  and?: Array< ModelMeetingDetailConditionInput | null > | null,
  or?: Array< ModelMeetingDetailConditionInput | null > | null,
  not?: ModelMeetingDetailConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
};

export type MeetingDetail = {
  __typename: "MeetingDetail",
  meeting_id?: string,
  attendees?:  Array<Attendee | null > | null,
  create_date_time?: string | null,
  end_date_time?: string | null,
  call_id?: string | null,
  external_meeting_id?: string | null,
  meeting_status?: string | null,
};

export type Attendee = {
  __typename: "Attendee",
  phone_number?: string | null,
  attendee_id?: string | null,
  attendee_type?: AttendeeType | null,
  attendee_join_type?: AttendeeJoinType | null,
};

export type ModelMeetingDetailFilterInput = {
  meeting_id?: ModelStringInput | null,
  attendees?: ModelStringInput | null,
  create_date_time?: ModelStringInput | null,
  end_date_time?: string | null,
  call_id?: ModelStringInput | null,
  external_meeting_id?: ModelStringInput | null,
  meeting_status?: ModelStringInput | null,
  and?: Array< ModelMeetingDetailFilterInput | null > | null,
  or?: Array< ModelMeetingDetailFilterInput | null > | null,
  not?: ModelMeetingDetailFilterInput | null,
};

export type MeetingDetailConnection = {
  __typename: "MeetingDetailConnection",
  items?:  Array<MeetingDetail | null > | null,
  nextToken?: string | null,
};

export type CreateMeetingDetailMutationVariables = {
  input?: MeetingDetailInput | null,
  condition?: ModelMeetingDetailConditionInput | null,
};

export type CreateMeetingDetailMutation = {
  createMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    attendees?:  Array< {
      __typename: "Attendee",
      phone_number?: string | null,
      attendee_id?: string | null,
      attendee_type?: AttendeeType | null,
      attendee_join_type?: AttendeeJoinType | null,
    } | null > | null,
    create_date_time?: string | null,
    end_date_time?: string | null,
    call_id?: string | null,
    external_meeting_id?: string | null,
    meeting_status?: string | null,
  } | null,
};

export type UpdateMeetingDetailMutationVariables = {
  input?: MeetingDetailInput | null,
  condition?: ModelMeetingDetailConditionInput | null,
};

export type UpdateMeetingDetailMutation = {
  updateMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    attendees?:  Array< {
      __typename: "Attendee",
      phone_number?: string | null,
      attendee_id?: string | null,
      attendee_type?: AttendeeType | null,
      attendee_join_type?: AttendeeJoinType | null,
    } | null > | null,
    create_date_time?: string | null,
    end_date_time?: string | null,
    call_id?: string | null,
    external_meeting_id?: string | null,
    meeting_status?: string | null,
  } | null,
};

export type DeleteMeetingDetailMutationVariables = {
  input?: MeetingDetailInput | null,
  condition?: ModelMeetingDetailConditionInput | null,
};

export type DeleteMeetingDetailMutation = {
  deleteMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    attendees?:  Array< {
      __typename: "Attendee",
      phone_number?: string | null,
      attendee_id?: string | null,
      attendee_type?: AttendeeType | null,
      attendee_join_type?: AttendeeJoinType | null,
    } | null > | null,
    create_date_time?: string | null,
    end_date_time?: string | null,
    call_id?: string | null,
    external_meeting_id?: string | null,
    meeting_status?: string | null,
  } | null,
};

export type PublishMeetingDetailUpdatesMutationVariables = {
  input?: MeetingDetailInput,
};

export type PublishMeetingDetailUpdatesMutation = {
  publishMeetingDetailUpdates?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    attendees?:  Array< {
      __typename: "Attendee",
      phone_number?: string | null,
      attendee_id?: string | null,
      attendee_type?: AttendeeType | null,
      attendee_join_type?: AttendeeJoinType | null,
    } | null > | null,
    create_date_time?: string | null,
    end_date_time?: string | null,
    call_id?: string | null,
    external_meeting_id?: string | null,
    meeting_status?: string | null,
  } | null,
};

export type GetMeetingDetailQueryVariables = {
  meetingId?: string,
};

export type GetMeetingDetailQuery = {
  getMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    attendees?:  Array< {
      __typename: "Attendee",
      phone_number?: string | null,
      attendee_id?: string | null,
      attendee_type?: AttendeeType | null,
      attendee_join_type?: AttendeeJoinType | null,
    } | null > | null,
    create_date_time?: string | null,
    end_date_time?: string | null,
    call_id?: string | null,
    external_meeting_id?: string | null,
    meeting_status?: string | null,
  } | null,
};

export type ListMeetingDetailsQueryVariables = {
  filter?: ModelMeetingDetailFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListMeetingDetailsQuery = {
  listMeetingDetails?:  {
    __typename: "MeetingDetailConnection",
    items?:  Array< {
      __typename: "MeetingDetail",
      meeting_id: string,
      attendees?:  Array< {
        __typename: "Attendee",
        phone_number?: string | null,
        attendee_id?: string | null,
        attendee_type?: AttendeeType | null,
        attendee_join_type?: AttendeeJoinType | null,
      } | null > | null,
      create_date_time?: string | null,
      end_date_time?: string | null,
      call_id?: string | null,
      external_meeting_id?: string | null,
      meeting_status?: string | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetMeetingDetailsByStatusQueryVariables = {
  meetingStatus?: string,
  limit?: number | null,
  nextToken?: string | null,
};

export type GetMeetingDetailsByStatusQuery = {
  getMeetingDetailsByStatus?:  {
    __typename: "MeetingDetailConnection",
    items?:  Array< {
      __typename: "MeetingDetail",
      meeting_id: string,
      attendees?:  Array< {
        __typename: "Attendee",
        phone_number?: string | null,
        attendee_id?: string | null,
        attendee_type?: AttendeeType | null,
        attendee_join_type?: AttendeeJoinType | null,
      } | null > | null,
      create_date_time?: string | null,
      end_date_time?: string | null,
      call_id?: string | null,
      external_meeting_id?: string | null,
      meeting_status?: string | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetMeetingDetailsByStatusAndCreateTimeQueryVariables = {
  meetingStatus?: string,
  startTime?: string,
  endTime?: string,
  limit?: number | null,
  nextToken?: string | null,
};

export type GetMeetingDetailsByStatusAndCreateTimeQuery = {
  getMeetingDetailsByStatusAndCreateTime?:  {
    __typename: "MeetingDetailConnection",
    items?:  Array< {
      __typename: "MeetingDetail",
      meeting_id: string,
      attendees?:  Array< {
        __typename: "Attendee",
        phone_number?: string | null,
        attendee_id?: string | null,
        attendee_type?: AttendeeType | null,
        attendee_join_type?: AttendeeJoinType | null,
      } | null > | null,
      create_date_time?: string | null,
      end_date_time?: string | null,
      call_id?: string | null,
      external_meeting_id?: string | null,
      meeting_status?: string | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type OnCreateMeetingDetailSubscription = {
  onCreateMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    attendees?:  Array< {
      __typename: "Attendee",
      phone_number?: string | null,
      attendee_id?: string | null,
      attendee_type?: AttendeeType | null,
      attendee_join_type?: AttendeeJoinType | null,
    } | null > | null,
    create_date_time?: string | null,
    end_date_time?: string | null,
    call_id?: string | null,
    external_meeting_id?: string | null,
    meeting_status?: string | null,
  } | null,
};

export type OnUpdateMeetingDetailSubscription = {
  onUpdateMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    attendees?:  Array< {
      __typename: "Attendee",
      phone_number?: string | null,
      attendee_id?: string | null,
      attendee_type?: AttendeeType | null,
      attendee_join_type?: AttendeeJoinType | null,
    } | null > | null,
    create_date_time?: string | null,
    end_date_time?: string | null,
    call_id?: string | null,
    external_meeting_id?: string | null,
    meeting_status?: string | null,
  } | null,
};

export type OnDeleteMeetingDetailSubscription = {
  onDeleteMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    attendees?:  Array< {
      __typename: "Attendee",
      phone_number?: string | null,
      attendee_id?: string | null,
      attendee_type?: AttendeeType | null,
      attendee_join_type?: AttendeeJoinType | null,
    } | null > | null,
    create_date_time?: string | null,
    end_date_time?: string | null,
    call_id?: string | null,
    external_meeting_id?: string | null,
    meeting_status?: string | null,
  } | null,
};
