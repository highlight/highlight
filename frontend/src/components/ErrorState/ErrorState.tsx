import { useAuthContext } from '@authentication/AuthContext';
import ButtonLink from '@components/Button/ButtonLink/ButtonLink';
import Space from '@components/Space/Space';
import { auth } from '@util/auth';
import { client } from '@util/graph';
import classNames from 'classnames';
import { H } from 'highlight.run';
import React, { useState } from 'react';

import Button from '../Button/Button/Button';
import ElevatedCard from '../ElevatedCard/ElevatedCard';
import styles from './ErrorState.module.scss';
import RequestAccess from './RequestAccess/RequestAccess';

export const ErrorState = ({
    message,
    errorString,
    shownWithHeader = false,
    showRequestAccess = false,
}: {
    message: string;
    errorString?: string;
    shownWithHeader?: boolean;
    showRequestAccess?: boolean;
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
                        <div className={styles.loggedInButtonGroup}>
                            <a href="/">
                                <Button
                                    type="primary"
                                    trackingId="ErrorStateGoToMyAccount"
                                >
                                    My Account
                                </Button>
                            </a>
                            <Button
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
                                Change User
                            </Button>
                            {showRequestAccess && <RequestAccess />}
                        </div>
                    ) : (
                        <Space size="small">
                            <ButtonLink
                                type="primary"
                                trackingId="ErrorStateSignIn"
                                {...(isLoggedIn
                                    ? { to: '/', href: undefined }
                                    : {
                                          to: undefined,
                                          href: '/',
                                          anchor: true,
                                      })}
                            >
                                Sign in
                            </ButtonLink>
                            <ButtonLink
                                trackingId="ErrorStateSignUp"
                                type="default"
                                {...(isLoggedIn
                                    ? {
                                          to: {
                                              pathname: '/?sign_up=1',
                                              state: {
                                                  previousPathName:
                                                      window.location.pathname,
                                              },
                                          },
                                          href: undefined,
                                      }
                                    : {
                                          to: undefined,
                                          href: '/?sign_up=1',
                                          anchor: true,
                                      })}
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
