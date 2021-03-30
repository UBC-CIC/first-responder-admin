import React, { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap';
import { API } from 'aws-amplify';
import { getMeetingDetailsByStatus } from '../../common/graphql/queries';
import MeetingDetailsTable from '../common/MeetingDetailsTable';

export const Dashboard = () => {
    const [items, updateItems] = useState([])

    useEffect(() => {
        async function callListAllMeetings() {
            try {
                const meetings: any = await API.graphql({
                    query: getMeetingDetailsByStatus,
                    variables: {
                        meetingStatus: "LIVE",
                        limit: 25
                    }
                });
                updateItems(meetings['data']['getMeetingDetailsByStatus']['items']);
                console.log('getMeetingDetailsByStatus meetings:', meetings);
            } catch (e) {
                console.log('getMeetingDetailsByStatus errors:', e.errors);
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