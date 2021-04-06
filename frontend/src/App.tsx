import React from 'react';
import './App.css';
import { AmplifyAuthenticator, AmplifySignUp } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import { Navigation } from './components/nav/Navigation'

function App() {

    const [authState, setAuthState] = React.useState<AuthState>();
    const [user, setUser] = React.useState<any>();

    React.useEffect(() => {
        return onAuthUIStateChange((nextAuthState, authData) => {
            setAuthState(nextAuthState);
            setUser(authData)
        });
    }, []);

    return authState === AuthState.SignedIn && user ? (
        <div className="App">
            <Navigation userName={user.username} authState={authState}/>
        </div>
    ) : (
            <div slot="sign-in" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                backgroundColor: 'white'
            }}>
                <Navigation userName={''} authState={authState}/>
                <AmplifyAuthenticator>
                    <AmplifySignUp
                        slot="sign-up"
                        headerText="Create New Account"
                        formFields={[
                            {
                                type: "name",
                                label: "Full Name",
                                placeholder: "Full Name",
                                required: true,
                            },
                            {
                                type: "username",
                                label: "User Name",
                                placeholder: "User Name",
                                required: true,
                            },
                            {
                                type: "email",
                                label: "Email",
                                placeholder: "Email Address",
                                required: true,
                            },
                            {
                                type: "password",
                                label: "Password",
                                placeholder: "Password (at least eight characters)",
                                required: true,
                            },
                            {
                                type: "phone_number",
                                label: "Phone Number",
                                placeholder: "Phone Number",
                                required: true,
                            },
                        ]}
                    />
                </AmplifyAuthenticator>
            </div>
        );
}

export default App;
