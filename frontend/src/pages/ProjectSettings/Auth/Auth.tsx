import { auth } from '@util/auth';
import firebase from 'firebase';
import React, { useEffect, useState } from 'react';

import styles from './Auth.module.scss';

const mfaDisplayName = 'MFA Display Name';
const phoneNumber = '9202791277';

const Auth: React.FC = () => {
    const [token, setToken] = useState('');

    useEffect(() => {
        const recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
            'request-otp',
            {
                size: 'invisible',
            }
        );

        recaptchaVerifier.verify().then((token) => {
            console.log('::: token', token);
            setToken(token);
        });

        auth.currentUser?.multiFactor
            .getSession()
            .then(function (multiFactorSession) {
                // Specify the phone number and pass the MFA session.
                const phoneInfoOptions = {
                    phoneNumber,
                    session: multiFactorSession,
                };
                const phoneAuthProvider = new firebase.auth.PhoneAuthProvider();

                // Send SMS verification code.
                return phoneAuthProvider.verifyPhoneNumber(
                    phoneInfoOptions,
                    recaptchaVerifier
                );
            })
            .then(function (verificationId) {
                const verificationCode = prompt('Please enter your code') || '';

                // Ask user for the verification code.
                const cred = firebase.auth.PhoneAuthProvider.credential(
                    verificationId,
                    verificationCode
                );
                const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(
                    cred
                );
                // Complete enrollment.
                return auth.currentUser?.multiFactor.enroll(
                    multiFactorAssertion,
                    mfaDisplayName
                );
            });
    }, []);

    return <div className={styles.auth}>Hello there!</div>;
};

export default Auth;
