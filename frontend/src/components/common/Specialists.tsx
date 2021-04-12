import { useState } from 'react'
import { Button, Modal, Table } from 'react-bootstrap';
import { faUserPlus, faPhoneSquareAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SpecialistProfile } from '../../common/types/API';
import { getSpecialistProfilesByStatus } from '../../common/graphql/queries';
import './Specialists.css';
import { API } from 'aws-amplify';

export const Specialists = (props: { status: String }) => {
    const [items, updateItems] = useState<Array<SpecialistProfile>>(new Array<SpecialistProfile>())

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);

    const onGetAvailableSpecialists = async () => {
        try {
            const userStatus = props.status;

            const specialists: any = await API.graphql({
                query: getSpecialistProfilesByStatus,
                variables: { 
                    userStatus: userStatus
                }
            });
            console.log('getSpecialistProfilesByStatus specialists:', specialists);

            const itemsReturned: Array<SpecialistProfile> = specialists['data']['getSpecialistProfilesByStatus']['items'];
            console.log('getMeetingDetailsByStatus meetings:', itemsReturned);
            updateItems(itemsReturned);

            setShow(true);

        } catch (e) {
            console.log('getMeetingDetailsByStatusAndCreateTime errors:', e.errors);
        }
    };

    return (
        <>
            <Button variant="light" onClick={onGetAvailableSpecialists} title="Add Specialists">
                <FontAwesomeIcon icon={faUserPlus} />
            </Button>

            <Modal 
                show={show} 
                onHide={handleClose}
                dialogClassName="modal-90w"
            >
                <Modal.Header closeButton>
                    <Modal.Title> {"Specialists - "}{props.status} </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Phone Number</th>
                                <th>Name</th>
                                <th>Organization</th>
                                <th>Role</th>
                                <th>Email</th>
                                <th>Notes</th>
                                <th>Status</th>
                                <th>Page</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items && items.map((specialist: SpecialistProfile | null) => (
                                <tr key={specialist?.email}>
                                    <td>
                                        {specialist?.phone_number}
                                    </td>
                                    <td>
                                        {specialist?.first_name}{' '}{specialist?.last_name}
                                    </td>
                                    <td>
                                        {specialist?.organization}
                                    </td>
                                    <td>
                                        {specialist?.user_role}
                                    </td>
                                    <td>
                                        {specialist?.email}
                                    </td>
                                    <td>
                                        {specialist?.notes}
                                    </td>
                                    <td>
                                        {specialist?.is_paged? "Paged" : "Free"}
                                    </td>
                                    <td>
                                        <Button variant="light">
                                            <FontAwesomeIcon icon={faPhoneSquareAlt} size="2x" color="#28a745" />
                                        </Button>
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


export default Specialists;