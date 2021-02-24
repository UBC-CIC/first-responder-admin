import React from 'react';
import './App.css';
import { Navigation } from './components/nav/Navigation'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { CallNotification } from './components/notifications/Notification';

function App() {
  return (
    <div className="App">
      <CallNotification/>
      <Navigation/>
    </div>
  );
}

//export default App;
export default withAuthenticator(App)
