import React, { useEffect, useRef, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { API } from "aws-amplify";
import { getMeetingDetailsByStatus } from "../../common/graphql/queries";
import MeetingDetailsTable from "../common/MeetingDetailsTable";
import { AttendeeType, MeetingDetail } from "../../common/types/API";
import {
  onCreateMeetingDetail,
  onUpdateMeetingDetail,
} from "../../common/graphql/subscriptions";

export const MeetingMap = () => {
  const [items, updateItems] = useState<Array<MeetingDetail>>(
    new Array<MeetingDetail>()
  );
  const stateRef = useRef<Array<MeetingDetail>>();
  stateRef.current = items;


  const filterMeetingsForLocation = (meetings: MeetingDetail[]) => {
    const filteredItems = meetings.filter((meeting) => !!getFirstResponderLocation(meeting) as boolean);
    return filteredItems;
  }
  /**
   *
   * @param meeting a MeetingDetail which you want to find the location of.
   * @returns the location if there exists a first responder with a location,
   */
  const getFirstResponderLocation = (meeting: MeetingDetail) => {
    if (!meeting?.attendees) return null;
    let { attendees } = meeting;
    if (!attendees?.length) {
      return null;
    }
    let firstResponder = attendees.find(
      (attendee) => attendee?.attendee_type === AttendeeType.FIRST_RESPONDER
    );
    return firstResponder?.location || null;
  };

  useEffect(() => {
    async function subscribeCreateMeetings() {
      const subscription: any = API.graphql({
        query: onCreateMeetingDetail,
      });

      subscription.subscribe({
        next: (data: any) => {
          const newItems = [];
          let found = false;
          if (data.value.data) {
            for (let item of stateRef.current!) {
              if (
                data.value.data.onCreateMeetingDetail.meeting_id ===
                item.meeting_id
              ) {
                // Found existing item so we will update this item
                newItems.push(data.value.data.onCreateMeetingDetail);
                found = true;
              } else {
                // Keep existing item
                newItems.push(item);
              }
            }
            if (!found) {
              newItems.push(data.value.data.onCreateMeetingDetail);
            }
            const filteredItems = filterMeetingsForLocation(newItems);
            updateItems(filteredItems);
          }
        },
        error: (error: any) => console.warn(error),
      });
    }

    async function subscribeUpdateMeetings() {
      const subscription: any = API.graphql({
        query: onUpdateMeetingDetail,
      });

      subscription.subscribe({
        next: (data: any) => {
          const newItems = [];
          if (data.value.data.onUpdateMeetingDetail) {
            for (let item of stateRef.current!) {
              if (
                data.value.data.onUpdateMeetingDetail.meeting_id ===
                item.meeting_id
              ) {
                // Found existing item so we will update this item
                newItems.push(data.value.data.onUpdateMeetingDetail);
              } else {
                // Keep existing item
                newItems.push(item);
              }
            }
            const filteredItems = filterMeetingsForLocation(newItems);

            updateItems(filteredItems);
          }
        },
        error: (error: any) => console.warn(error),
      });
    }

    async function callListAllMeetings() {
      try {
        const meetings: any = await API.graphql({
          query: getMeetingDetailsByStatus,
          variables: {
            meetingStatus: "ACTIVE",
            limit: 25,
          },
        });
        const itemsReturned: Array<MeetingDetail> =
          meetings["data"]["getMeetingDetailsByStatus"]["items"];
        console.log("getMeetingDetailsByStatus meetings:", itemsReturned);
        
        const filteredItems = filterMeetingsForLocation(itemsReturned);
        console.log(filteredItems);
        
        updateItems(filteredItems);
      } catch (e) {
        console.log("getMeetingDetailsByStatus errors:", e.errors);
      }
    }

    callListAllMeetings();
    subscribeCreateMeetings();
    subscribeUpdateMeetings();
  }, []);
  console.log(items);

  return (
    <Container fluid>
      <Row />
    </Container>
  );
};

export default MeetingMap;
