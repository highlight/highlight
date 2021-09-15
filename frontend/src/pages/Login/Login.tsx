import classNames from 'classnames';
import { H } from 'highlight.run';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuthContext } from '../../authentication/AuthContext';
import commonStyles from '../../Common.module.scss';
import Button from '../../components/Button/Button/Button';
import { LoadingPage } from '../../components/Loading/Loading';
import { AppRouter } from '../../routers/AppRouter/AppRouter';
import { ReactComponent as GoogleLogo } from '../../static/google.svg';
import { auth, googleProvider } from '../../util/auth';
import { Landing } from '../Landing/Landing';
import styles from './Login.module.scss';

export const AuthAdminRouter = () => {
    const { isAuthLoading, admin } = useAuthContext();
    useEffect(() => {
        if (admin) {
            const { email, id, name } = admin;
            let identifyMetadata: {
                id: string;
                avatar?: string;
                name: string;
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
        }
    }, [admin]);

    if (isAuthLoading) {
        return <LoadingPage />;
    }

    return <AppRouter />;
};

type Inputs = {
    email: string;
    password: string;
};

const LoginForm = () => {
    const {
        watch,
        register,
        handleSubmit,
        errors,
        reset,
        setError,
    } = useForm<Inputs>();
    const [signIn, setSignIn] = useState<boolean>(true);
    const { isAuthLoading, isLoggedIn } = useAuthContext();
    const [firebaseError, setFirebaseError] = useState('');

    const onSubmit = (data: Inputs) => {
        if (signIn) {
            auth.signInWithEmailAndPassword(data.email, data.password).catch(
                (error) => {
                    setError('password', {
                        type: 'manual',
                        message: error.toString(),
                    });
                }
            );
        } else {
            auth.createUserWithEmailAndPassword(
                data.email,
                data.password
            ).catch((error) => {
                setError('password', {
                    type: 'manual',
                    message: error.toString(),
                });
            });
        }
    };

    const changeState = () => {
        setSignIn(!signIn);
        reset();
    };

    if (isAuthLoading) {
        return <LoadingPage />;
    }

    if (isLoggedIn) {
        return <AuthAdminRouter />;
    }

    return (
        <Landing>
            <div className={styles.loginPage}>
                <div className={styles.loginFormWrapper}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className={styles.loginForm}
                    >
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
                        <input
                            placeholder={'Email'}
                            name="email"
                            ref={register({ required: true })}
                            className={commonStyles.input}
                        />
                        <div className={commonStyles.errorMessage}>
                            {errors.email && 'Enter an email yo!'}
                        </div>
                        <input
                            placeholder={'Password'}
                            type="password"
                            name="password"
                            ref={register({ required: true })}
                            className={commonStyles.input}
                        />
                        {!signIn && (
                            <>
                                <input
                                    placeholder={'Confirm Password'}
                                    type="password"
                                    name="confirm-password"
                                    ref={register({
                                        required: true,
                                        validate: (value) => {
                                            if (value !== watch('password')) {
                                                setError('password', {
                                                    type: 'mismatch',
                                                    message:
                                                        'Mismatched passwords',
                                                });
                                                return "Passwords don't match.";
                                            }
                                        },
                                    })}
                                    className={commonStyles.input}
                                />
                            </>
                        )}
                        <div className={commonStyles.errorMessage}>
                            {errors.password && errors.password.message}
                        </div>
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
