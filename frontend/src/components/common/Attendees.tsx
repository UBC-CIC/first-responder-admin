import { Badge, Button, Col, Container, OverlayTrigger, Popover, Row } from 'react-bootstrap';
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Attendee } from '../../common/types/API';

export const Attendees = (props: { attendeeList: (Attendee | null)[] }) => {
    const popover = (
        <Popover id="popover-basic">
            <Popover.Title as="h3">Attendees List</Popover.Title>
            <Popover.Content>
                <Container>
                    {props.attendeeList && props.attendeeList.map((attendee: Attendee | null) => (
                        <Row>
                            <Col xs={6} md={4}>
                                {attendee?.phone_number}
                            </Col>
                            <Col xs={6} md={4}>
                                {attendee?.attendee_join_type}
                            </Col>
                        </Row>
                    ))}
                </Container>
            </Popover.Content>
        </Popover>
    );


    return (
        <OverlayTrigger trigger="click" placement="right" overlay={popover}>
            <Button variant="light">
                <FontAwesomeIcon icon={faUser} />{' '}
                <Badge pill variant="dark">
                    {props.attendeeList?.length}
                </Badge>
            </Button>
        </OverlayTrigger>
    )
}


export default Attendees;