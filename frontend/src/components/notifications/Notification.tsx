import { useEffect, useRef } from 'react';
import NotificationSystem from 'react-notification-system';
import { API } from 'aws-amplify';
import { onCreateMeetingDetail } from '../../common/graphql/subscriptions';
import { SOUNDS_DICTIONARY } from './sounds/Sounds';

// TODO: Override style. To see what can properties be overridden see https://github.com/igorprado/react-notification-system/blob/master/src/styles.js
const style = {
  NotificationItem: { // Override the notification item
    DefaultStyle: { // Applied to every notification, regardless of the notification level
      margin: '10px 5px 2px 1px',
      background: '#eeeeee',
      fontSize: 12,
      fontWeight: 600
    },

    success: { // Applied only to the success notification item
      color: '#33691E'
    }
  }
}

export const CallNotification = () => {
  const notificationSystemRef = useRef<NotificationSystem.System>(null);


  useEffect(() => {
    const subscribeCreateMeetings = () => {
      const subscription: any = API.graphql({
        query: onCreateMeetingDetail
      })

      subscription.subscribe({
        next: (data: any) => {
          console.log('data received from create subscription:', data.value.data.onCreateMeetingDetails.status);
          if (data.value.data !== undefined && data.value.data.onCreateMeetingDetails.meeting_status === 'ACTIVE') {
            const currentNotifications = notificationSystemRef.current;
            if (currentNotifications) {
              currentNotifications.addNotification({
                message: 'New call in progress with meeting id : ' + data.value.data.onCreateMeetingDetails.meeting_id,
                level: 'success',
                autoDismiss: 0,
                dismissible: 'both'
              });
              const alarmAudio = new Audio(SOUNDS_DICTIONARY.get('beep'));
              alarmAudio.play();
            }
          }
        }
      })
    }

    subscribeCreateMeetings();

  }, []);

  return (
    <div>
      <NotificationSystem
        style={style}
        ref={notificationSystemRef} />
    </div>
  );
}