import { Button, Table } from 'react-bootstrap';
import { faPhoneSquareAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SpecialistProfile } from '../../common/types/API';
import './Specialists.css';

export const SpecialistsTable = (props: { items: Array<SpecialistProfile> }) => {
    return (
        <div>
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
                    {props.items && props.items.map((specialist: SpecialistProfile | null) => (
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
                                {specialist?.is_paged ? "Paged" : "Free"}
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
        </div>
    )
}


export default SpecialistsTable;