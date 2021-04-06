import { AuthState } from '@aws-amplify/ui-components';

export interface AppAuthStateProps {
    userName: string;
    authState: AuthState|undefined;
}