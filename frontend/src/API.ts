/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateMeetingDetailsInput = {
  id?: string | null,
  meetingId: string,
  status?: string | null,
  service_desk_attendee?: string | null,
  attendeeList?: Array< string | null > | null,
  createDateTime?: string | null,
};

export type ModelMeetingDetailsConditionInput = {
  meetingId?: ModelStringInput | null,
  status?: ModelStringInput | null,
  service_desk_attendee?: ModelStringInput | null,
  attendeeList?: ModelStringInput | null,
  createDateTime?: ModelStringInput | null,
  and?: Array< ModelMeetingDetailsConditionInput | null > | null,
  or?: Array< ModelMeetingDetailsConditionInput | null > | null,
  not?: ModelMeetingDetailsConditionInput | null,
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
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type MeetingDetails = {
  __typename: "MeetingDetails",
  id?: string,
  meetingId?: string,
  status?: string | null,
  service_desk_attendee?: string | null,
  attendeeList?: Array< string | null > | null,
  createDateTime?: string | null,
  createdAt?: string,
  updatedAt?: string,
};

export type UpdateMeetingDetailsInput = {
  id: string,
  meetingId?: string | null,
  status?: string | null,
  service_desk_attendee?: string | null,
  attendeeList?: Array< string | null > | null,
  createDateTime?: string | null,
};

export type DeleteMeetingDetailsInput = {
  id?: string | null,
};

export type ModelMeetingDetailsFilterInput = {
  id?: ModelIDInput | null,
  meetingId?: ModelStringInput | null,
  status?: ModelStringInput | null,
  service_desk_attendee?: ModelStringInput | null,
  attendeeList?: ModelStringInput | null,
  createDateTime?: ModelStringInput | null,
  and?: Array< ModelMeetingDetailsFilterInput | null > | null,
  or?: Array< ModelMeetingDetailsFilterInput | null > | null,
  not?: ModelMeetingDetailsFilterInput | null,
};

export type ModelIDInput = {
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
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelMeetingDetailsConnection = {
  __typename: "ModelMeetingDetailsConnection",
  items?:  Array<MeetingDetails | null > | null,
  nextToken?: string | null,
};

export type CreateMeetingDetailsMutationVariables = {
  input?: CreateMeetingDetailsInput,
  condition?: ModelMeetingDetailsConditionInput | null,
};

export type CreateMeetingDetailsMutation = {
  createMeetingDetails?:  {
    __typename: "MeetingDetails",
    id: string,
    meetingId: string,
    status?: string | null,
    service_desk_attendee?: string | null,
    attendeeList?: Array< string | null > | null,
    createDateTime?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateMeetingDetailsMutationVariables = {
  input?: UpdateMeetingDetailsInput,
  condition?: ModelMeetingDetailsConditionInput | null,
};

export type UpdateMeetingDetailsMutation = {
  updateMeetingDetails?:  {
    __typename: "MeetingDetails",
    id: string,
    meetingId: string,
    status?: string | null,
    service_desk_attendee?: string | null,
    attendeeList?: Array< string | null > | null,
    createDateTime?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteMeetingDetailsMutationVariables = {
  input?: DeleteMeetingDetailsInput,
  condition?: ModelMeetingDetailsConditionInput | null,
};

export type DeleteMeetingDetailsMutation = {
  deleteMeetingDetails?:  {
    __typename: "MeetingDetails",
    id: string,
    meetingId: string,
    status?: string | null,
    service_desk_attendee?: string | null,
    attendeeList?: Array< string | null > | null,
    createDateTime?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetMeetingDetailsQueryVariables = {
  id?: string,
};

export type GetMeetingDetailsQuery = {
  getMeetingDetails?:  {
    __typename: "MeetingDetails",
    id: string,
    meetingId: string,
    status?: string | null,
    service_desk_attendee?: string | null,
    attendeeList?: Array< string | null > | null,
    createDateTime?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListMeetingDetailssQueryVariables = {
  filter?: ModelMeetingDetailsFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListMeetingDetailssQuery = {
  listMeetingDetailss?:  {
    __typename: "ModelMeetingDetailsConnection",
    items?:  Array< {
      __typename: "MeetingDetails",
      id: string,
      meetingId: string,
      status?: string | null,
      service_desk_attendee?: string | null,
      attendeeList?: Array< string | null > | null,
      createDateTime?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type OnCreateMeetingDetailsSubscription = {
  onCreateMeetingDetails?:  {
    __typename: "MeetingDetails",
    id: string,
    meetingId: string,
    status?: string | null,
    service_desk_attendee?: string | null,
    attendeeList?: Array< string | null > | null,
    createDateTime?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateMeetingDetailsSubscription = {
  onUpdateMeetingDetails?:  {
    __typename: "MeetingDetails",
    id: string,
    meetingId: string,
    status?: string | null,
    service_desk_attendee?: string | null,
    attendeeList?: Array< string | null > | null,
    createDateTime?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteMeetingDetailsSubscription = {
  onDeleteMeetingDetails?:  {
    __typename: "MeetingDetails",
    id: string,
    meetingId: string,
    status?: string | null,
    service_desk_attendee?: string | null,
    attendeeList?: Array< string | null > | null,
    createDateTime?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};
