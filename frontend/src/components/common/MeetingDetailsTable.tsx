import { faUser, faPhoneSquareAlt, faPhoneSquare, faUserPlus, faHeadset } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import { Table, Badge } from 'react-bootstrap';
//import BootstrapTable from 'react-bootstrap-table-next';
//import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import { MeetingDetails } from '../../API';


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
                        items.items.map((item: MeetingDetails) => (
                            <tr>
                                <td>{item.meetingId}</td>
                                <td>
                                    {
                                        item.status === "Live" ? (
                                            <Badge pill variant="success">
                                                {item.status}
                                            </Badge>
                                        ) : (
                                                <Badge pill variant="secondary">
                                                    {item.status}
                                                </Badge>
                                            )
                                    }
                                </td>
                                <td>
                                    <FontAwesomeIcon icon={faUser} />{' '}
                                    <Badge pill variant="dark">
                                        {item.attendeeList?.length}
                                    </Badge>
                                </td>
                                {
                                    item.status === "Live" ? (
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
                                        item.createDateTime !== undefined && item.createDateTime !== null ? (
                                            new Date(item.createDateTime).toLocaleTimeString([],{ year: 'numeric', month: 'long', day: 'numeric' })
                                        ) : (item.createDateTime)
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