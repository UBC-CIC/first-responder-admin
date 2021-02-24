import React, { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap';
import { API } from 'aws-amplify';
import { listMeetingDetailss } from '../../graphql/queries';
import MeetingDetailsTable from '../common/MeetingDetailsTable';

export const Dashboard = () => {
    const [items, updateItems] = useState([])

    useEffect(() => {
        async function callListAllMeetings() {
            try {
                const meetings: any = await API.graphql({
                    query: listMeetingDetailss,
                    variables: {limit: 25}
                });
                updateItems(meetings['data']['listMeetingDetailss']['items']);
                console.log('listMeetingDetailss meetings:', meetings);
            } catch (e) {
                console.log('listMeetingDetailss errors:', e.errors);
            }
        }

        callListAllMeetings()
    }, []);


    return (
        <Container fluid >
            <Row>
                <Col>
                    <div>
                        <MeetingDetailsTable items={items}/>
                    </div>
                </Col>
            </Row>
        </Container>
    )
}

export default Dashboard;