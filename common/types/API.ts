/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type MeetingDetailInput = {
  meeting_id: string,
  meeting_status?: string | null,
  service_desk_attendee?: string | null,
  attendee_list?: Array< string | null > | null,
  create_date_time?: string | null,
};

export type ModelMeetingDetailConditionInput = {
  meeting_status?: ModelStringInput | null,
  service_desk_attendee?: ModelStringInput | null,
  attendee_list?: ModelStringInput | null,
  create_date_time?: ModelStringInput | null,
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
  meeting_status?: string | null,
  service_desk_attendee?: string | null,
  attendee_list?: Array< string | null > | null,
  create_date_time?: string | null,
};

export type ModelMeetingDetailFilterInput = {
  meeting_id?: ModelStringInput | null,
  meeting_status?: ModelStringInput | null,
  service_desk_attendee?: ModelStringInput | null,
  attendee_list?: ModelStringInput | null,
  create_date_time?: ModelStringInput | null,
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
    meeting_status?: string | null,
    service_desk_attendee?: string | null,
    attendee_list?: Array< string | null > | null,
    create_date_time?: string | null,
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
    meeting_status?: string | null,
    service_desk_attendee?: string | null,
    attendee_list?: Array< string | null > | null,
    create_date_time?: string | null,
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
    meeting_status?: string | null,
    service_desk_attendee?: string | null,
    attendee_list?: Array< string | null > | null,
    create_date_time?: string | null,
  } | null,
};

export type GetMeetingDetailQueryVariables = {
  meetingId?: string,
};

export type GetMeetingDetailQuery = {
  getMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    meeting_status?: string | null,
    service_desk_attendee?: string | null,
    attendee_list?: Array< string | null > | null,
    create_date_time?: string | null,
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
      meeting_status?: string | null,
      service_desk_attendee?: string | null,
      attendee_list?: Array< string | null > | null,
      create_date_time?: string | null,
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
      meeting_status?: string | null,
      service_desk_attendee?: string | null,
      attendee_list?: Array< string | null > | null,
      create_date_time?: string | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type OnCreateMeetingDetailSubscription = {
  onCreateMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    meeting_status?: string | null,
    service_desk_attendee?: string | null,
    attendee_list?: Array< string | null > | null,
    create_date_time?: string | null,
  } | null,
};

export type OnUpdateMeetingDetailSubscription = {
  onUpdateMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    meeting_status?: string | null,
    service_desk_attendee?: string | null,
    attendee_list?: Array< string | null > | null,
    create_date_time?: string | null,
  } | null,
};

export type OnDeleteMeetingDetailSubscription = {
  onDeleteMeetingDetail?:  {
    __typename: "MeetingDetail",
    meeting_id: string,
    meeting_status?: string | null,
    service_desk_attendee?: string | null,
    attendee_list?: Array< string | null > | null,
    create_date_time?: string | null,
  } | null,
};
