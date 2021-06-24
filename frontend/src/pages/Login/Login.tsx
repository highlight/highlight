import classNames from 'classnames';
import { H } from 'highlight.run';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useForm } from 'react-hook-form';

import commonStyles from '../../Common.module.scss';
import Button from '../../components/Button/Button/Button';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import { LoadingPage } from '../../components/Loading/Loading';
import { useGetAdminQuery } from '../../graph/generated/hooks';
import { AppRouter } from '../../routers/AppRouter/AppRouter';
import { ReactComponent as GoogleLogo } from '../../static/google.svg';
import { auth, googleProvider } from '../../util/auth';
import { Landing } from '../Landing/Landing';
import { RequestAccessPage } from '../RequestAccess/RequestAccess';
import styles from './Login.module.scss';

export const AuthAdminRouter = () => {
    const { loading, error, data } = useGetAdminQuery();

    const admin = data?.admin;
    useEffect(() => {
        if (admin) {
            const { email, id, name } = admin;
            window.analytics.identify(email, {
                id,
                name,
            });
            H.identify(email, {
                id,
                name,
            });
        }
    }, [admin]);
    if (error) {
        return (
            <ErrorState
                message={`
        Seems like you we had issue with your login 😢.
        Feel free to log out and try again, or otherwise,
        get in contact with us!
        `}
                errorString={'AuthAdminRouter error: ' + JSON.stringify(error)}
            />
        );
    }

    if (loading) {
        return <LoadingPage />;
    }
    return <AppRouter />;
};

type Inputs = {
    email: string;
    password: string;
};

const LoginForm = () => {
    const url = window.location.hostname;
    const {
        watch,
        register,
        handleSubmit,
        errors,
        reset,
        setError,
    } = useForm<Inputs>();
    const [signIn, setSignIn] = useState<boolean>(true);
    const [firebaseError, setFirebaseError] = useState('');
    const [user, loading, error] = useAuthState(auth);

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

    if (loading) {
        return <LoadingPage />;
    }

    if (user) {
        return <AuthAdminRouter />;
    }

    if (
        url.toLowerCase() === 'highlight.run' ||
        window.location.pathname.toLowerCase().includes('request')
    ) {
        return (
            <Landing>
                <RequestAccessPage />
            </Landing>
        );
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
                    <div className={commonStyles.errorMessage}>
                        {JSON.stringify(error)}
                    </div>
                </div>
            </div>
        </Landing>
    );
};

export default LoginForm;
