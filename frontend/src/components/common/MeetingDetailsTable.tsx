import { navItem } from '@aws-amplify/ui';
import { faUser, faPhoneSquareAlt, faPhoneSquare, faUserPlus, faHeadset, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import { Table, Badge, Button } from 'react-bootstrap';
//import BootstrapTable from 'react-bootstrap-table-next';
//import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import { AttendeeType, MeetingDetail } from '../../common/types/API';
import Attendees from './Attendees';
import Specialists from './Specialists';
import './meetingDetailsTable.css';

export const MeetingDetailsTable = (props: {items: Array<MeetingDetail>}) => {

    // const columns = [{
    //     dataField: 'meetingId',
    //     text: 'Meeting ID',
    //     sort: true,
    //     filter: textFilter(),
    //     headerStyle: { width: '160px' }
    // }, {
    //     dataField: 'status',
    //     text: 'Status',
    //     sort: true,
    //     filter: textFilter(),
    //     headerStyle: { width: '380px' }
    // }, {
    //     dataField: 'service_desk_attendee',
    //     text: 'Admin',
    //     sort: true,
    //     filter: textFilter(),
    //     headerStyle: { width: '140px' }
    // }, {
    //     dataField: 'attendeeList',
    //     text: 'Attendees',
    //     sort: true,
    //     filter: textFilter(),
    //     headerStyle: { width: '140px' }
    // }, {
    //     dataField: 'createDateTime',
    //     text: 'Start Time',
    //     sort: true,
    //     filter: textFilter(),
    //     headerStyle: { width: '140px' }
    // }];

    const getServiceDeskAttendee = (item: MeetingDetail) => {
        if (item.attendees) {
            for (let attendee of item.attendees) {
                if (attendee?.attendee_type == AttendeeType.SERVICE_DESK) {
                    return attendee.username;
                }
            }
        }
        return "";
    }

    return (
        <div className="meeting-table">
            {/* <BootstrapTable
                bootstrap4
                hover
                condensed
                keyField='meetingId'
                data={items.items}
                columns={columns}
                rowStyle={{ height: '60px', verticalAlign: 'center' }}
                filter={filterFactory()}
                filterPosition='top'
                noDataIndication='No Meetings in Progress.'>
            </BootstrapTable> */}

            <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                        <th>Meeting ID</th>
                        <th>Status</th>
                        <th>Attendees</th>
                        <th>Action</th>
                        <th>Start Time</th>
                        <th>Service Desk Attendee</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.items.map((item: MeetingDetail) => (
                            <tr key={item.meeting_id}>
                                <td>{item.external_meeting_id}</td>
                                <td>
                                    {
                                        item.meeting_status === "ACTIVE" ? (
                                            <Badge pill variant="success">
                                                {item.meeting_status}
                                            </Badge>
                                        ) : (
                                                <Badge pill variant="secondary">
                                                    {item.meeting_status}
                                                </Badge>
                                            )
                                    }
                                </td>
                                <td>
                                    {
                                        item.attendees && item.attendees.length > 0 ? (
                                            <Attendees attendeeList={item.attendees} />
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
                                            <Specialists status="AVAILABLE" />{' | '}
                                            <FontAwesomeIcon icon={faPhoneSquare} size="2x" color="red" />{'  '}
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
                                        getServiceDeskAttendee(item) === "" ? 
                                            <><FontAwesomeIcon icon={faHeadset} />{' '}{getServiceDeskAttendee(item)}</> : <><FontAwesomeIcon icon={faExclamationTriangle} />{' '}No Service Desk Attendees</>
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