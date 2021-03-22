import { faUser, faPhoneSquareAlt, faPhoneSquare, faUserPlus, faHeadset } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import { Table, Badge } from 'react-bootstrap';
//import BootstrapTable from 'react-bootstrap-table-next';
//import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import { MeetingDetail } from '../../common/types/API';


export default function MeetingDetailsTable(items: any) {

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

    return (
        <div>
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
                        items.items.map((item: MeetingDetail) => (
                            <tr>
                                <td>{item.meeting_id}</td>
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
                                    <FontAwesomeIcon icon={faUser} />{' '}
                                    <Badge pill variant="dark">
                                        {item.attendee_list?.length}
                                    </Badge>
                                </td>
                                {
                                    item.meeting_status === "ACTIVE" ? (
                                        <td>
                                            <FontAwesomeIcon icon={faPhoneSquareAlt} size="2x" color="#28a745" />{' | '}
                                            <FontAwesomeIcon icon={faUserPlus} size="2x" />{' | '}
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
                                    <FontAwesomeIcon icon={faHeadset} />{' '}
                                    {item.service_desk_attendee}
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        </div>
    )
}