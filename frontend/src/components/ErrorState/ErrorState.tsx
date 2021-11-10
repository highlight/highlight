import { useAuthContext } from '@authentication/AuthContext';
import ButtonLink from '@components/Button/ButtonLink/ButtonLink';
import Space from '@components/Space/Space';
import classNames from 'classnames';
import { H } from 'highlight.run';
import React, { useState } from 'react';

import { auth } from '../../util/auth';
import { client } from '../../util/graph';
import Button from '../Button/Button/Button';
import ElevatedCard from '../ElevatedCard/ElevatedCard';
import styles from './ErrorState.module.scss';

export const ErrorState = ({
    message,
    errorString,
    shownWithHeader = false,
}: {
    message: string;
    errorString?: string;
    shownWithHeader?: boolean;
}) => {
    const { isLoggedIn } = useAuthContext();
    const [showError, setShowError] = useState(false);

    return (
        <div
            className={classNames(styles.errorWrapper, {
                [styles.shownWithHeader]: shownWithHeader,
            })}
        >
            <ElevatedCard title="Woops, something's wrong!">
                <p className={styles.errorBody}>
                    {message}
                    {errorString !== undefined && (
                        <span
                            className={styles.expandButton}
                            onClick={() => setShowError((t) => !t)}
                        >
                            {showError ? 'show less' : 'show more'}
                        </span>
                    )}
                </p>
                {showError && (
                    <code className={styles.errorBody}>{errorString}</code>
                )}
                <div className={styles.buttonGroup}>
                    {isLoggedIn ? (
                        <>
                            <a href="/">
                                <Button
                                    type="primary"
                                    trackingId="ErrorStateGoToMyAccount"
                                >
                                    Go to my Account
                                </Button>
                            </a>
                            <Button
                                style={{ marginLeft: 10 }}
                                trackingId="ErrorStateLoginAsDifferentUser"
                                onClick={async () => {
                                    try {
                                        auth.signOut();
                                    } catch (e) {
                                        if (e instanceof Error) {
                                            H.consumeError(e);
                                        }
                                    }
                                    client.clearStore();
                                }}
                            >
                                Sign in as a different User
                            </Button>
                        </>
                    ) : (
                        <Space size="small">
                            <ButtonLink
                                type="primary"
                                trackingId="ErrorStateSignIn"
                                to="/"
                            >
                                Sign in
                            </ButtonLink>
                            <ButtonLink
                                trackingId="ErrorStateSignUp"
                                type="default"
                                to={{
                                    pathname: '/?sign_up=1',
                                    state: {
                                        previousPathName:
                                            window.location.pathname,
                                    },
                                }}
                            >
                                Sign up
                            </ButtonLink>
                        </Space>
                    )}
                </div>
            </ElevatedCard>
        </div>
    );
};
