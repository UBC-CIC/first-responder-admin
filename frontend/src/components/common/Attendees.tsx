import React, { useEffect, useState } from 'react'
import { Badge, Button, Col, Container, Modal, Table, Row } from 'react-bootstrap';
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Attendee } from '../../common/types/API';
import './Attendees.css';

export const Attendees = (props: { attendeeList: (Attendee | null)[] }) => {

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Button variant="light" onClick={handleShow}>
                <FontAwesomeIcon icon={faUser} />{' '}
                <Badge pill variant="dark">
                    {props.attendeeList?.length}
                </Badge>
            </Button>

            <Modal 
                show={show} 
                onHide={handleClose}
                dialogClassName="modal-90w"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Attendees List</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Phone Number</th>
                                <th>Name</th>
                                <th>Organization</th>
                                <th>Role</th>
                                <th>Connected Via</th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.attendeeList && props.attendeeList.map((attendee: Attendee | null) => (
                                <tr key={attendee?.attendee_id}>
                                    <td>
                                        {attendee?.phone_number}
                                    </td>
                                    <td>
                                        {attendee?.first_name}{' '}{attendee?.last_name}
                                    </td>
                                    <td>
                                        {attendee?.organization}
                                    </td>
                                    <td>
                                        {attendee?.user_role}
                                    </td>
                                    <td>
                                        {attendee?.attendee_join_type}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}


export default Attendees;