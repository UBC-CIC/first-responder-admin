import { useMeetingManager } from 'amazon-chime-sdk-component-library-react';

const JoinMeeting = () => {
  const meetingManager = useMeetingManager();

  const joinMeeting = async () => {
    // Fetch the meeting and attendee data from your server
    const response = await fetch('/my-server');
    const data = await response.json();

    const joinData = {
      meetingInfo: data.Meeting,
      attendeeInfo: data.Attendee
    };

    // Use the join API to create a meeting session
    await meetingManager.join(joinData);

    // At this point you can let users setup their devices, or start the session immediately
    await meetingManager.start();
  };

  return <button onClick={joinMeeting}>Join</button>;
};

export default JoinMeeting;