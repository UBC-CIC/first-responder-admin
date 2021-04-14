import { useState } from 'react'
import { faUser, faPhoneSquareAlt, faPhoneSquare, faUserPlus, faHeadset, faExclamationTriangle, faPhone, faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import { Table, Badge, Button, Alert, Tooltip, OverlayTrigger, Popover } from 'react-bootstrap';
//import BootstrapTable from 'react-bootstrap-table-next';
//import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import { AttendeeState, AttendeeType, MeetingDetail } from '../../common/types/API';
import Attendees from './Attendees';
import Specialists from './Specialists';
import './meetingDetailsTable.css';
import { API } from 'aws-amplify';
import { updateMeetingDetail } from '../../common/graphql/mutations';

export const MeetingDetailsTable = (props: {items: Array<MeetingDetail>}) => {

    const [currTime, setCurrTime] = useState(new Date());

    setInterval(() => {
        setCurrTime(new Date());
    }, 1000);

    const timeSince = (start: string, end: string | null | undefined) => {
        let actualStart = new Date(start);
        let actualEnd = currTime;
        if (end) {
            actualEnd = new Date(end);
        }

        let secs = (actualEnd.getTime() - actualStart.getTime()) / 1000;
        var hours = Math.floor(secs / 3600);
        var minutes = Math.floor(secs / 60) % 60;
        var seconds = Math.floor(secs % 60);
        return [hours, minutes, seconds]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":")
    }

    const getServiceDeskAttendee = (item: MeetingDetail) => {
        if (item.attendees) {
            for (let attendee of item.attendees) {
                if (attendee?.attendee_type === AttendeeType.SERVICE_DESK) {
                    return attendee.username;
                }
            }
        }
        return null;
    }

    const onModifyComment = async (meetingDetail: MeetingDetail, event: any) => {
        event.preventDefault()
        event.stopPropagation()
        const updatedComment = event.target.innerText;
        meetingDetail.meeting_comments = updatedComment;

        try {
            const data: any = await API.graphql({
                query: updateMeetingDetail,
                variables: {input: meetingDetail}
            })
        } catch (e) {
            console.log('Mutation returned error', e)
        }
    }

    return (
        <div className="meeting-table">
            <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                        <th>Meeting ID</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Attendees</th>
                        <th>Action</th>
                        <th>Start Time</th>
                        <th>Duration</th>
                        <th>Service Desk Attendee</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.items.map((item: MeetingDetail) => (
                            <tr key={item.meeting_id}>
                                <td>{item.external_meeting_id}</td>
                                <td>
                                    <OverlayTrigger
                                        trigger="hover"
                                        placement="bottom"
                                        overlay={
                                            <Popover id={`meeting-popover-${item.meeting_id}`}>
                                                <Popover.Content>
                                                    Click to edit the meeting title
                                                </Popover.Content>
                                            </Popover>
                                        }
                                    >
                                        <span contentEditable 
                                                suppressContentEditableWarning
                                                className={item.meeting_comments === "" ? "faint-text" : ""}
                                                onBlur={e => onModifyComment(item, e)}
                                        >
                                            {item.meeting_comments === "" ? "Meeting" : item.meeting_comments}
                                        </span>
                                    </OverlayTrigger>
                                </td>
                                <td>
                                    {
                                        item.meeting_status === "ACTIVE" ? (
                                            <Badge variant="success">
                                                {item.meeting_status}
                                            </Badge>
                                        ) : (
                                                <Badge variant="secondary">
                                                    {item.meeting_status}
                                                </Badge>
                                            )
                                    }
                                </td>
                                <td>
                                    {
                                        item.attendees && item.attendees.filter(a => a?.attendee_state === AttendeeState.IN_CALL).length > 0 ? (
                                            <Attendees attendeeList={item.attendees.filter(a => a?.attendee_state === AttendeeState.IN_CALL)} />
                                        ) : (
                                            <div>
                                                <FontAwesomeIcon icon={faUser} />{' '}
                                                <Badge pill variant="dark">
                                                    {0}
                                                </Badge>
                                            </div>
                                        )
                                    }
                                </td>
                                {
                                    item.meeting_status === "ACTIVE" ? (
                                        <td>
                                            <Specialists status="AVAILABLE" />
                                            {' '}
                                            <Button variant="danger" title="End Meeting"><FontAwesomeIcon icon={faPhone} />{'  '}</Button>
                                        </td>
                                    ) : (
                                        <td>
                                            <FontAwesomeIcon icon={faPhoneSquareAlt} size="2x" color="grey" />{' | '}
                                            <FontAwesomeIcon icon={faUserPlus} size="2x" color="grey"/>{' | '}
                                            <FontAwesomeIcon icon={faPhoneSquare} size="2x" color="grey" />{'  '}
                                        </td>
                                    )
                                }
                                <td>
                                    {
                                        item.create_date_time !== undefined && item.create_date_time !== null ? (
                                            new Date(item.create_date_time).toLocaleTimeString([],{ year: 'numeric', month: 'long', day: 'numeric' })
                                        ) : (item.create_date_time)
                                    }
                                </td>
                                <td>
                                    {
                                        item.create_date_time !== undefined && item.create_date_time !== null && (
                                            <>{timeSince(item.create_date_time, null)}</>
                                        )
                                    }
                                </td>
                                <td>
                                    {
                                        getServiceDeskAttendee(item) ? 
                                            <><FontAwesomeIcon icon={faHeadset} />{' '}{getServiceDeskAttendee(item)}</> : <Badge variant="danger">No Check-Ins</Badge>
                                    }
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        </div>
    )
}

export default MeetingDetailsTable;