import { useAuthContext } from '@authentication/AuthContext';
import Input from '@components/Input/Input';
import {
    AppLoadingState,
    useAppLoadingContext,
} from '@context/AppLoadingContext';
import VerifyEmailCard from '@pages/Login/components/VerifyEmailCard/VerifyEmailCard';
import useLocalStorage from '@rehooks/local-storage';
import { AppRouter } from '@routers/AppRouter/AppRouter';
import { auth, googleProvider } from '@util/auth';
import { message } from 'antd';
import classNames from 'classnames';
import { H } from 'highlight.run';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { BooleanParam, useQueryParam } from 'use-query-params';

import commonStyles from '../../Common.module.scss';
import Button from '../../components/Button/Button/Button';
import { ReactComponent as GoogleLogo } from '../../static/google.svg';
import { Landing } from '../Landing/Landing';
import styles from './Login.module.scss';

export const AuthAdminRouter = () => {
    const { isAuthLoading, admin } = useAuthContext();
    const { setLoadingState } = useAppLoadingContext();
    useEffect(() => {
        if (admin) {
            const { email, id, name } = admin;
            let identifyMetadata: {
                id: string;
                avatar?: string;
                name: string;
                highlightDisplayName?: string;
                email?: string;
            } = {
                id,
                name,
            };

            if (admin.photo_url) {
                identifyMetadata = {
                    ...identifyMetadata,
                    avatar: admin.photo_url,
                };
            }
            H.identify(email, identifyMetadata);
            H.getSessionURL()
                .then((sessionUrl) => {
                    window.rudderanalytics.identify(id, {
                        avatar: admin.photo_url,
                        email: email,
                        name: name,
                        role: admin?.role,
                        sessionUrl: sessionUrl,
                        user_id: admin?.uid,
                    });
                    window.Intercom('boot', {
                        app_id: 'gm6369ty',
                        alignment: 'right',
                        hide_default_launcher: true,
                        email: admin?.email,
                        user_id: admin?.uid,
                        sessionUrl,
                        role: admin?.role,
                    });
                })
                .catch(() => {
                    window.Intercom('boot', {
                        app_id: 'gm6369ty',
                        alignment: 'right',
                        hide_default_launcher: true,
                        email: admin?.email,
                        user_id: admin?.uid,
                        role: admin?.role,
                    });
                });
        }
    }, [admin]);

    useEffect(() => {
        if (isAuthLoading) {
            setLoadingState(AppLoadingState.LOADING);
        }
    }, [isAuthLoading, setLoadingState]);

    if (isAuthLoading) {
        return null;
    }

    return <AppRouter />;
};

enum LoginFormState {
    SignIn,
    SignUp,
    /** The user signed up with email/password. We need to block the user from doing anything until they verify their email. */
    VerifyEmail,
}

const LoginForm = () => {
    const [signUpParam] = useQueryParam('sign_up', BooleanParam);
    const [formState, setFormState] = useState<LoginFormState>(
        signUpParam ? LoginFormState.SignUp : LoginFormState.SignIn
    );
    const [, setSignUpReferral] = useLocalStorage(
        'HighlightSignUpReferral',
        ''
    );
    const { isAuthLoading, isLoggedIn, admin } = useAuthContext();
    const [firebaseError, setFirebaseError] = useState('');
    const { setLoadingState: setIsLoading } = useAppLoadingContext();
    const [isLoadingFirebase, setIsLoadingFirebase] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState<string | null>(null);
    const history = useHistory<{ previousPathName?: string }>();

    const onSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setIsLoadingFirebase(true);
        if (formState === LoginFormState.SignIn) {
            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    setIsLoadingFirebase(false);
                })
                .catch((error) => {
                    setError(error.toString());
                    setIsLoadingFirebase(false);
                });
        } else {
            auth.createUserWithEmailAndPassword(email, password)
                .then(() => {
                    auth.currentUser?.sendEmailVerification();
                    setIsLoadingFirebase(false);
                })
                .catch((error) => {
                    setError(error.toString());
                    setIsLoadingFirebase(false);
                });

            // Redirect the user to their initial path instead to creating a new workspace.
            // We do this because this happens when a new user clicks on a Highlight link that was shared to them and they don't have an account yet.
            if (history.location.state?.previousPathName) {
                history.push(history.location.state.previousPathName);
            }
        }
    };

    const changeState = (nextState: LoginFormState) => {
        setFormState(nextState);
        setError(null);
    };

    // Record where the new user was referred from.
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref') || document.referrer;

        setSignUpReferral(ref);
    }, [setSignUpReferral]);

    useEffect(() => {
        if (isAuthLoading) {
            setIsLoading(AppLoadingState.LOADING);
        }
    }, [isAuthLoading, setIsLoading]);

    useEffect(() => {
        if (isLoggedIn && admin) {
            if (admin.email_verified === false) {
                setFormState(LoginFormState.VerifyEmail);
            } else {
                if (formState !== LoginFormState.VerifyEmail) {
                    setFormState(LoginFormState.SignIn);
                }
            }
        }
    }, [admin, admin?.email_verified, formState, isLoggedIn]);

    if (isAuthLoading) {
        return null;
    }

    if (isLoggedIn && formState !== LoginFormState.VerifyEmail) {
        return <AuthAdminRouter />;
    }

    if (isLoggedIn && formState === LoginFormState.VerifyEmail) {
        return (
            <VerifyEmailCard
                onStartHandler={() => {
                    setFormState(LoginFormState.SignIn);
                }}
            />
        );
    }

    return (
        <Landing>
            <div className={styles.loginPage}>
                <div className={styles.loginFormWrapper}>
                    <form onSubmit={onSubmit} className={styles.loginForm}>
                        <div className={styles.loginTitleWrapper}>
                            <h2 className={styles.loginTitle}>
                                Welcome{' '}
                                {formState === LoginFormState.SignIn && 'back'}{' '}
                                to Highlight.
                            </h2>
                            <p className={styles.loginSubTitle}>
                                {formState === LoginFormState.SignIn ? (
                                    <>
                                        New here?{' '}
                                        <span
                                            onClick={() => {
                                                changeState(
                                                    LoginFormState.SignUp
                                                );
                                            }}
                                            className={
                                                styles.loginStateSwitcher
                                            }
                                        >
                                            Create an account.
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{' '}
                                        <span
                                            onClick={() => {
                                                changeState(
                                                    LoginFormState.SignIn
                                                );
                                            }}
                                            className={
                                                styles.loginStateSwitcher
                                            }
                                        >
                                            Sign in.
                                        </span>
                                    </>
                                )}
                            </p>
                        </div>
                        <div className={styles.inputContainer}>
                            <Input
                                placeholder={'Email'}
                                name="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                }}
                                autoFocus
                                required
                            />
                            <Input
                                placeholder={'Password'}
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                }}
                                required
                            />
                            {formState === LoginFormState.SignUp && (
                                <>
                                    <Input
                                        placeholder={'Confirm Password'}
                                        type="password"
                                        name="confirm-password"
                                        required
                                        value={passwordConfirmation}
                                        onChange={(e) => {
                                            setPasswordConfirmation(
                                                e.target.value
                                            );
                                        }}
                                    />
                                </>
                            )}
                        </div>
                        {error && (
                            <div className={commonStyles.errorMessage}>
                                {error}
                            </div>
                        )}
                        <p
                            className={classNames(styles.resetPasswordText, {
                                [styles.canResetPasswordText]: email.length,
                            })}
                            onClick={() => {
                                if (!email.length) return;
                                auth.sendPasswordResetEmail(email)
                                    .then(() => {
                                        message.success(
                                            'Password reset email sent!'
                                        );
                                    })
                                    .catch((error) => {
                                        message.error(
                                            `Failed to send password reset email. ${error}`
                                        );
                                    });
                            }}
                        >
                            Forgot password?
                        </p>
                        <Button
                            trackingId="LoginSignInUp"
                            className={commonStyles.submitButton}
                            type="primary"
                            htmlType="submit"
                            loading={isLoadingFirebase}
                        >
                            {formState === LoginFormState.SignIn
                                ? 'Sign In'
                                : 'Sign Up'}
                        </Button>
                    </form>
                    <p className={styles.otherSigninText}>
                        or sign{' '}
                        {formState === LoginFormState.SignIn ? 'in' : 'up'} with
                    </p>
                    <Button
                        trackingId="LoginWithGoogle"
                        className={classNames(
                            commonStyles.secondaryButton,
                            styles.googleButton
                        )}
                        onClick={() => {
                            auth.signInWithRedirect(googleProvider).catch((e) =>
                                setFirebaseError(JSON.stringify(e))
                            );
                        }}
                        loading={isLoadingFirebase}
                    >
                        <GoogleLogo className={styles.googleLogoStyle} />
                        <span className={styles.googleText}>
                            Google Sign{' '}
                            {formState === LoginFormState.SignIn ? 'In' : 'Up'}
                        </span>
                    </Button>
                    <div className={commonStyles.errorMessage}>
                        {firebaseError}
                    </div>
                </div>
            </div>
        </Landing>
    );
};

export default LoginForm;
