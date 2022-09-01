import Button from '@components/Button/Button/Button';
import Input from '@components/Input/Input';
import { auth } from '@util/auth';
import { client } from '@util/graph';
import firebase from 'firebase';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

import styles from './Auth.module.scss';

const mfaDisplayName = 'Phone';

enum AuthState {
    Enroll,
    Enrolled,
    Login,
}

const Auth: React.FC = () => {
    const [error, setError] = useState(null);
    const [status, setStatus] = useState<AuthState>(AuthState.Enroll);
    const Component = STATUS_COMPONENT_MAP[status];

    useEffect(() => {
        if (auth.currentUser?.multiFactor.enrolledFactors.length) {
            setStatus(AuthState.Enrolled);
            return;
        }

        // Firebase won't allow a user to enable 2FA unless they have recently
        // signed in. If they haven't logged in recently, show a login form.
        if (
            moment().diff(moment(auth.currentUser?.metadata.lastSignInTime)) >
            10 * 60 * 1000
        ) {
            setStatus(AuthState.Login);
        }
    }, []);

    return (
        <div className={styles.auth}>
            <Component setStatus={setStatus} setError={setError} />
            {error && <div>{JSON.stringify(error)}</div>}
            Enrolled Factors:{' '}
            <code>
                {JSON.stringify(auth.currentUser?.multiFactor.enrolledFactors)}
            </code>
            <div id="recaptcha"></div>
        </div>
    );
};

interface Props {
    setError: (error: any) => void;
    setStatus: (status: AuthState) => void;
}

const Login: React.FC<Props> = ({ setError, setStatus }) => {
    return (
        <div>
            <h2>Log In Again</h2>

            <Button
                trackingId="logInAgainFor2fa"
                onClick={() => {
                    auth.signOut();
                    client.clearStore();
                }}
            >
                Sign Out
            </Button>
        </div>
    );
};

const Enroll: React.FC<Props> = ({ setError, setStatus }) => {
    const [setup, setSetup] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState<string>('');

    useEffect(() => {
        const authorize = async () => {
            const recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
                'recaptcha',
                {
                    size: 'invisible',
                }
            );
            await recaptchaVerifier.verify();

            const multiFactorSession = await auth.currentUser?.multiFactor.getSession();
            const phoneAuthProvider = new firebase.auth.PhoneAuthProvider();

            // Send SMS verification code.
            const verificationId =
                (await phoneAuthProvider
                    .verifyPhoneNumber(
                        {
                            phoneNumber,
                            session: multiFactorSession,
                        },
                        recaptchaVerifier
                    )
                    .catch(setError)) || '';

            // Ask user for the verification code.
            const verificationCode = prompt('Please enter your code') || '';
            const cred = firebase.auth.PhoneAuthProvider.credential(
                verificationId,
                verificationCode
            );
            const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(
                cred
            );

            // Complete enrollment.
            await auth.currentUser?.multiFactor
                .enroll(multiFactorAssertion, mfaDisplayName)
                .catch(setError);

            setStatus(AuthState.Enrolled);
        };

        if (setup) {
            authorize();
        }
    }, [setup]);

    return (
        <div>
            <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
            />

            <Button trackingId="setup2fa" onClick={() => setSetup(true)}>
                Setup 2FA
            </Button>
        </div>
    );
};

const Enrolled: React.FC<Props> = ({ setError, setStatus }) => {
    return (
        <div>
            Enrolled!{' '}
            <Button
                trackingId="remove2fa"
                onClick={async () => {
                    const currentFactor =
                        auth.currentUser?.multiFactor.enrolledFactors[0];

                    if (currentFactor) {
                        await auth.currentUser?.multiFactor.unenroll(
                            currentFactor
                        );

                        setStatus(AuthState.Enroll);
                    }
                }}
            >
                Remove 2FA
            </Button>
        </div>
    );
};

const STATUS_COMPONENT_MAP: { [key in AuthState]: React.FC<Props> } = {
    [AuthState.Enroll]: Enroll,
    [AuthState.Enrolled]: Enrolled,
    [AuthState.Login]: Login,
};

export default Auth;
