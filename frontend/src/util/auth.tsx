/* eslint-disable @typescript-eslint/no-unused-vars */
import 'firebase/auth';

import { isOnPrem } from '@util/onPrem/onPremUtils';
import * as firebase from 'firebase/app';

let firebaseConfig: any;
let firebaseConfigString: string;

if (process.env.REACT_APP_FIREBASE_CONFIG_OBJECT) {
    firebaseConfigString = process.env.REACT_APP_FIREBASE_CONFIG_OBJECT ?? '';
} else {
    firebaseConfigString = window._highlightFirebaseConfigString;
}

// NOTE: we use eval() here (rather than JSON.parse) because its more in-tune
// with the string presented to a developer in the firebase console.
// This value is passed at build time, so security concerns are put aside.
try {
    firebaseConfig = eval('(' + firebaseConfigString + ')');
} catch (e) {
    throw new Error('Error parsing incoming firebase config' + e.toString());
}

window._highlightFirebaseConfig = firebaseConfig;

firebase.initializeApp(firebaseConfig);
export const googleProvider = new firebase.auth.GoogleAuthProvider();

/**
 * An authentication implementation for on-prem deployments.
 * This only supports email and password authentication.
 * Not all methods are implemented because we only use some of the methods. If you're using a new method then you will need to implement it.
 */
class HighlightOnPremAuthentication implements firebase.auth.Auth {
    app: firebase.app.App;
    tenantId: string | null;
    currentUser: firebase.User | null;
    languageCode: string | null;
    settings: firebase.auth.AuthSettings;

    constructor() {
        this.tenantId = null;
        this.currentUser = null;
        this.languageCode = null;
        this.settings = {
            appVerificationDisabledForTesting: false,
        };
        this.app = {} as firebase.app.App;
    }
    async signOut(): Promise<void> {
        this.currentUser = null;
    }

    applyActionCode(code: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    checkActionCode(code: string): Promise<firebase.auth.ActionCodeInfo> {
        throw new Error('Method not implemented.');
    }
    confirmPasswordReset(code: string, newPassword: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    createUserWithEmailAndPassword(
        email: string,
        password: string
    ): Promise<firebase.auth.UserCredential> {
        throw new Error('Method not implemented.');
    }
    fetchSignInMethodsForEmail(email: string): Promise<string[]> {
        throw new Error('Method not implemented.');
    }
    isSignInWithEmailLink(emailLink: string): boolean {
        throw new Error('Method not implemented.');
    }
    getRedirectResult(): Promise<firebase.auth.UserCredential> {
        throw new Error('Method not implemented.');
    }
    onAuthStateChanged(
        nextOrObserver:
            | firebase.Observer<any, Error>
            | ((a: firebase.User | null) => any),
        error?: (a: firebase.auth.Error) => any,
        completed?: firebase.Unsubscribe
    ): firebase.Unsubscribe {
        if (nextOrObserver) {
            // @ts-expect-error
            nextOrObserver(this.currentUser);
        }
        return () => {};
    }
    onIdTokenChanged(
        nextOrObserver:
            | firebase.Observer<any, Error>
            | ((a: firebase.User | null) => any),
        error?: (a: firebase.auth.Error) => any,
        completed?: firebase.Unsubscribe
    ): firebase.Unsubscribe {
        throw new Error('Method not implemented.');
    }
    sendSignInLinkToEmail(
        email: string,
        actionCodeSettings: firebase.auth.ActionCodeSettings
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    sendPasswordResetEmail(
        email: string,
        actionCodeSettings?: firebase.auth.ActionCodeSettings | null
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    setPersistence(persistence: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    signInAndRetrieveDataWithCredential(
        credential: firebase.auth.AuthCredential
    ): Promise<firebase.auth.UserCredential> {
        throw new Error('Method not implemented.');
    }
    signInAnonymously(): Promise<firebase.auth.UserCredential> {
        throw new Error('Method not implemented.');
    }
    signInWithCredential(
        credential: firebase.auth.AuthCredential
    ): Promise<firebase.auth.UserCredential> {
        throw new Error('Method not implemented.');
    }
    signInWithCustomToken(
        token: string
    ): Promise<firebase.auth.UserCredential> {
        throw new Error('Method not implemented.');
    }
    signInWithEmailAndPassword(
        email: string,
        password: string
    ): Promise<firebase.auth.UserCredential> {
        throw new Error('Method not implemented.');
    }
    signInWithPhoneNumber(
        phoneNumber: string,
        applicationVerifier: firebase.auth.ApplicationVerifier
    ): Promise<firebase.auth.ConfirmationResult> {
        throw new Error('Method not implemented.');
    }
    signInWithEmailLink(
        email: string,
        emailLink?: string
    ): Promise<firebase.auth.UserCredential> {
        throw new Error('Method not implemented.');
    }
    signInWithPopup(
        provider: firebase.auth.AuthProvider
    ): Promise<firebase.auth.UserCredential> {
        throw new Error('Method not implemented.');
    }
    signInWithRedirect(provider: firebase.auth.AuthProvider): Promise<void> {
        throw new Error('Method not implemented.');
    }
    updateCurrentUser(user: firebase.User | null): Promise<void> {
        throw new Error('Method not implemented.');
    }
    useDeviceLanguage(): void {
        throw new Error('Method not implemented.');
    }
    useEmulator(url: string): void {
        throw new Error('Method not implemented.');
    }
    verifyPasswordResetCode(code: string): Promise<string> {
        throw new Error('Method not implemented.');
    }
}

export const auth = isOnPrem
    ? ((new HighlightOnPremAuthentication() as unknown) as firebase.auth.Auth)
    : firebase.auth();
