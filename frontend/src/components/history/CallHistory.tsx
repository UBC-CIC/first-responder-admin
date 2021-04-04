import { useRef, useState } from 'react'
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { API } from 'aws-amplify';
import { getMeetingDetailsByStatusAndCreateTime } from '../../common/graphql/queries';
import MeetingDetailsTable from '../common/MeetingDetailsTable';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import './history.css';

export const CallHistory = () => {
    const [items, updateItems] = useState([])
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState((new Date()));
    const statusRef = useRef<HTMLSelectElement>(null);

    const onGetHistoryByTimeRange = async () => {
        try {
            const meetingStatus = statusRef.current ? statusRef.current.value : "ACTIVE";
            const meetings: any = await API.graphql({
                query: getMeetingDetailsByStatusAndCreateTime,
                variables: { 
                    meetingStatus: meetingStatus,
                    startTime: startDate,
                    endTime: endDate,
                    limit: 25 
                }
            });
            updateItems(meetings['data']['getMeetingDetailsByStatusAndCreateTime']['items']);
            console.log('getMeetingDetailsByStatusAndCreateTime meetings:', meetings);
            if (statusRef.current) {
              console.log('Status is :', statusRef.current.value)
            }
        } catch (e) {
            console.log('getMeetingDetailsByStatusAndCreateTime errors:', e.errors);
        }
    };

    // useEffect(() => {
    //     async function callListAllMeetings() {
    //         try {
    //             const meetings: any = await API.graphql({
    //                 query: listMeetingDetailss,
    //                 variables: { limit: 25 }
    //             });
    //             updateItems(meetings['data']['listMeetingDetailss']['items']);
    //             console.log('listMeetingDetailss meetings:', meetings);
    //         } catch (e) {
    //             console.log('listMeetingDetailss errors:', e.errors);
    //         }
    //     }
    //     callListAllMeetings()
    // }, []);


    return (
        <Container fluid >
            <Row className="history-search-row">
                <Col>
                <Form onSubmit={() => onGetHistoryByTimeRange()}>
                    <Row>
                        <Col>
                           <DatePicker
                             selected={startDate}
                             isClearable
                             showTimeSelect
                             dateFormat="MMMM d, yyyy h:mm aa"
                             onChange={(date: Date) => setStartDate(date)} />
                        </Col>
                        <Col> 
                           <DatePicker 
                             selected={endDate}
                             isClearable
                             showTimeSelect
                             dateFormat="MMMM d, yyyy h:mm aa"
                             onChange={(date: Date) => setEndDate(date)} />
                        </Col>
                        <Col>
                            <Form.Control 
                              as="select" 
                              placeholder="Call Status" 
                              ref={statusRef}>
                                <option>Stage...</option>
                                <option>Live</option>
                                <option>Ended</option>
                            </Form.Control>
                        </Col>
                        <Col>
                            <Button variant="primary"
                                onClick={() => onGetHistoryByTimeRange()}>
                                Search
                            </Button>
                        </Col>
                    </Row>
                </Form>
                </Col>
            </Row>
            <Row className="history-search-row">
                <Col>
                    <div>
                        <MeetingDetailsTable items={items} />
                    </div>
                </Col>
            </Row>
        </Container>
    )
}

export default CallHistory;