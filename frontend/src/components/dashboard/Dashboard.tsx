import React, { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap';
import { API } from 'aws-amplify';
import { getMeetingDetailsByStatus } from '../../common/graphql/queries';
import MeetingDetailsTable from '../common/MeetingDetailsTable';
import { MeetingDetail } from '../../common/types/API';

export const Dashboard = () => {
    const [items, updateItems] = useState<Array<MeetingDetail>>(new Array<MeetingDetail>())

    useEffect(() => {
        async function callListAllMeetings() {
            try {
                const meetings: any = await API.graphql({
                    query: getMeetingDetailsByStatus,
                    variables: {
                        meetingStatus: "ACTIVE",
                        limit: 25
                    }
                });
                const itemsReturned: Array<MeetingDetail> = meetings['data']['getMeetingDetailsByStatus']['items'];
                console.log('getMeetingDetailsByStatus meetings:', itemsReturned);
                updateItems(itemsReturned);
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