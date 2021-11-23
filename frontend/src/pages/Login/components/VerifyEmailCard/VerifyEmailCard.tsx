import Button from '@components/Button/Button/Button';
import ButtonLink from '@components/Button/ButtonLink/ButtonLink';
import Card from '@components/Card/Card';
import Dot from '@components/Dot/Dot';
import { useAppLoadingContext } from '@context/AppLoadingContext';
import { useGetAdminQuery } from '@graph/hooks';
import EmailAnimation from '@lottie/email.json';
import { Landing } from '@pages/Landing/Landing';
import { auth } from '@util/auth';
import { message } from 'antd';
import Lottie from 'lottie-react';
import React, { useEffect, useState } from 'react';

import styles from './VerifyEmailCard.module.scss';

interface Props {
    onStartHandler: () => void;
}

const VerifyEmailCard = ({ onStartHandler }: Props) => {
    const { setIsLoading } = useAppLoadingContext();
    const { data, stopPolling } = useGetAdminQuery({
        pollInterval: 1000,
    });
    const [
        sendingVerificationEmailLoading,
        setSendingVerificationEmailLoading,
    ] = useState(false);

    useEffect(() => {
        setIsLoading(false);
    }, [setIsLoading]);

    const isEmailVerified = data?.admin?.email_verified || false;
    //     const isEmailVerified = false;

    useEffect(() => {
        if (isEmailVerified) {
            stopPolling();
        }
    }, [isEmailVerified, stopPolling]);

    return (
        <Landing>
            <Card className={styles.card}>
                <Lottie
                    animationData={EmailAnimation}
                    className={styles.animation}
                />
                <h2>{!isEmailVerified ? 'Verify Email' : 'Email Verified!'}</h2>

                {isEmailVerified && (
                    <>
                        <p>
                            Awesome! You've verified your email. Let's get
                            started now 😉
                        </p>
                        <ButtonLink
                            trackingId="VerifyEmailStart"
                            to="/"
                            onClick={onStartHandler}
                        >
                            Start Highlighting
                        </ButtonLink>
                    </>
                )}
                {!isEmailVerified && (
                    <>
                        <p>
                            We sent you an email ({data?.admin?.email}) with a
                            link to verify your email.
                        </p>

                        <div className={styles.dotContainer}>
                            <Dot pulse className={styles.dot} />
                            Waiting for email to be verified...
                        </div>

                        <div className={styles.actionsContainer}>
                            <Button
                                trackingId="ResendVerificationEmail"
                                type="primary"
                                onClick={() => {
                                    setSendingVerificationEmailLoading(true);
                                    auth.currentUser
                                        ?.sendEmailVerification()
                                        .then(() => {
                                            message.success(
                                                `Sent another email to ${data?.admin?.email}!`
                                            );
                                            setSendingVerificationEmailLoading(
                                                false
                                            );
                                        })
                                        .catch((_e) => {
                                            const e = _e as {
                                                code: string;
                                            };
                                            let msg = '';

                                            switch (e.code) {
                                                case 'auth/too-many-requests':
                                                    msg = `We've already sent another email recently. If you can't find it please try again later or reach out to us.`;
                                                    break;

                                                default:
                                                    msg =
                                                        "There was a problem sending another email. Please try again. If you're still having trouble please reach out to us!";
                                                    break;
                                            }
                                            setSendingVerificationEmailLoading(
                                                false
                                            );
                                            message.error(msg);
                                        });
                                }}
                                loading={sendingVerificationEmailLoading}
                            >
                                Resend Verification Email
                            </Button>
                            <Button
                                trackingId="ResendVerificationEmail"
                                type="default"
                                onClick={() => {
                                    window.Intercom('showNewMessage');
                                }}
                            >
                                Chat with the Highlight Team
                            </Button>
                        </div>
                    </>
                )}
            </Card>
        </Landing>
    );
};

export default VerifyEmailCard;
