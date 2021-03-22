import * as React from 'react';
import { Badge } from 'react-bootstrap';
import { useEffect, useState, useRef } from 'react';
import { API } from 'aws-amplify';
import { onCreateMeetingDetail, onDeleteMeetingDetail, onUpdateMeetingDetail } from '../../common/graphql/subscriptions';


export const CallsBadge = () => {
    const [meetingCount, setMeetingCount] = useState(0)
    const meetingCountRef = useRef(0);
    meetingCountRef.current = meetingCount;

    useEffect(() => {
        const subscribeCreateMeetings = () => {
            const subscription:any = API.graphql({
                query: onCreateMeetingDetail
            })

            subscription.subscribe({
                next: (data:any) => {
                    console.log('data received from create subscription:', data.value.data.onCreateMeetingDetails.meeting_status);
                    if (data.value.data !== undefined && data.value.data.onCreateMeetingDetails.meeting_status === 'ACTIVE') {
                        setMeetingCount(meetingCountRef.current + 1)
                    }
                }
            })
        }

        const subscribeUpdateMeetings = () => {
            const subscription:any = API.graphql({
                query: onUpdateMeetingDetail
            })

            subscription.subscribe({
                next: (data:any) => {
                    console.log('data received from update subscription:', data);
                    if (data.value.data !== undefined && data.value.data.onUpdateMeetingDetails.meeting_status === 'CLOSED') {
                        var newCount = meetingCountRef.current - 1
                        setMeetingCount(newCount > 0 ? newCount : 0)
                    }
                }
            })
        }

        const subscribeDeleteMeetings = () => {
            const subscription:any = API.graphql({
                query: onDeleteMeetingDetail
            })

            subscription.subscribe({
                next: (data:any) => {
                    console.log('data received from delete subscription:', data);
                    var newCount = meetingCountRef.current - 1
                    setMeetingCount(newCount > 0 ? newCount : 0)
                    
                }
            })
        }

        // const unsubscribeAdjustment = (adjustmentId: number) => {
        //     subscription.unsubscribe()
        // }

        // const currentRoute = window.location.pathname
        // console.log('current route', currentRoute)

        subscribeCreateMeetings()
        subscribeUpdateMeetings()
        subscribeDeleteMeetings()

    }, [])

    return (
        meetingCount > 0 ? (
        <Badge pill variant="danger">
            {meetingCount}
        </Badge>
        ) : (<div></div>)
    )
}