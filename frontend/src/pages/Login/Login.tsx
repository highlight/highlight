import Input from '@components/Input/Input';
import { useAppLoadingContext } from '@context/AppLoadingContext';
import classNames from 'classnames';
import { H } from 'highlight.run';
import React, { useEffect, useState } from 'react';
import { BooleanParam, useQueryParam } from 'use-query-params';

import { useAuthContext } from '../../authentication/AuthContext';
import commonStyles from '../../Common.module.scss';
import Button from '../../components/Button/Button/Button';
import { AppRouter } from '../../routers/AppRouter/AppRouter';
import { ReactComponent as GoogleLogo } from '../../static/google.svg';
import { auth, googleProvider } from '../../util/auth';
import { Landing } from '../Landing/Landing';
import styles from './Login.module.scss';

export const AuthAdminRouter = () => {
    const { isAuthLoading, admin } = useAuthContext();
    const { setIsLoading } = useAppLoadingContext();
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
            H.getSessionURL().then((sessionUrl) => {
                window.Intercom('boot', {
                    app_id: 'gm6369ty',
                    alignment: 'right',
                    hide_default_launcher: true,
                    email: admin?.email,
                    user_id: admin?.uid,
                    sessionUrl,
                });
            });
        }
    }, [admin]);

    useEffect(() => {
        if (isAuthLoading) {
            setIsLoading(true);
        }
    }, [isAuthLoading, setIsLoading]);

    if (isAuthLoading) {
        return null;
    }

    return <AppRouter />;
};

const LoginForm = () => {
    const [signUpParam] = useQueryParam('sign_up', BooleanParam);
    // Show sign in state if the sign_up param is false or undefined
    const [signIn, setSignIn] = useState<boolean>(!signUpParam);
    const { isAuthLoading, isLoggedIn } = useAuthContext();
    const [firebaseError, setFirebaseError] = useState('');
    const { setIsLoading } = useAppLoadingContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState<string | null>(null);

    const onSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        if (signIn) {
            auth.signInWithEmailAndPassword(email, password).catch((error) => {
                setError(error.toString());
            });
        } else {
            auth.createUserWithEmailAndPassword(email, password).catch(
                (error) => {
                    setError(error.toString());
                }
            );
        }
        setEmail('');
        setPassword('');
        setPasswordConfirmation('');
    };

    const changeState = () => {
        setSignIn(!signIn);
        setError(null);
    };

    useEffect(() => {
        if (isAuthLoading) {
            setIsLoading(true);
        }
    }, [isAuthLoading, setIsLoading]);

    if (isAuthLoading) {
        return null;
    }

    if (isLoggedIn) {
        return <AuthAdminRouter />;
    }

    return (
        <Landing>
            <div className={styles.loginPage}>
                <div className={styles.loginFormWrapper}>
                    <form onSubmit={onSubmit} className={styles.loginForm}>
                        <div className={styles.loginTitleWrapper}>
                            <h2 className={styles.loginTitle}>
                                Welcome {signIn && 'back'} to Highlight.
                            </h2>
                            <p className={styles.loginSubTitle}>
                                {signIn ? (
                                    <>
                                        New here?{' '}
                                        <span
                                            onClick={changeState}
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
                                            onClick={changeState}
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
                            {!signIn && (
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
                        <Button
                            trackingId="LoginSignInUp"
                            className={commonStyles.submitButton}
                            type="primary"
                            htmlType="submit"
                        >
                            {signIn ? 'Sign In' : 'Sign Up'}
                        </Button>
                    </form>
                    <p className={styles.otherSigninText}>
                        or sign {signIn ? 'in' : 'up'} with
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
                    >
                        <GoogleLogo className={styles.googleLogoStyle} />
                        <span className={styles.googleText}>
                            Google Sign {signIn ? 'In' : 'Up'}
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
