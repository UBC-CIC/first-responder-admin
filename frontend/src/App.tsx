import React from 'react';
import './App.css';
import { AmplifyAuthenticator, AmplifySignUp } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import { Navigation } from './components/nav/Navigation'
import { CallNotification } from './components/notifications/Notification';
import { url } from 'inspector';

function App() {

    const [authState, setAuthState] = React.useState<AuthState>();
    const [user, setUser] = React.useState<any>();

    React.useEffect(() => {
        return onAuthUIStateChange((nextAuthState, authData) => {
            setAuthState(nextAuthState);
            setUser(authData)
        });
    }, []);

    const authenticatorTheme: any = {
        signInButtonIcon: { backgroundColor: 'none' },
    }

    return authState === AuthState.SignedIn && user ? (
        <div className="App">
            <CallNotification />
            <Navigation userName={user.username}/>
        </div>
    ) : (
            <div slot="sign-in" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                backgroundImage: `url('/login-splash.jpg')`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
            }}>
                <AmplifyAuthenticator>
                    <AmplifySignUp
                        slot="sign-up"
                        headerText="Create New Account"
                        usernameAlias="email"
                        formFields={[
                            {
                                type: "name",
                                label: "Full Name",
                                placeholder: "Full Name",
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
                    {/* <AmplifySignUp slot="sign-in" usernameAlias="email" /> */}
                </AmplifyAuthenticator>
            </div>
        );
}

export default App;
