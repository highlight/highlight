import React, { useState, useEffect } from 'react';
import { LoadingPage } from '../../components/Loading/Loading';
import { useGetAdminQuery } from '../../graph/generated/hooks';
import commonStyles from '../../Common.module.scss';
import { ReactComponent as GoogleLogo } from '../../static/google.svg';

import styles from './Login.module.scss';
import { AppRouter } from '../../routers/AppRouter/AppRouter';
import { H } from 'highlight.run';
import { useForm } from 'react-hook-form';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, googleProvider } from '../../util/auth';
import { Home } from '../Home/Home';
import { RequestAccessPage } from '../RequestAccess/RequestAccess';

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
        return <p>{'AuthAdminRouter error: ' + JSON.stringify(error)}</p>;
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

export const LoginForm = () => {
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

    if (url.startsWith('https://highlight.run') || url.endsWith('request')) {
        return (
            <Home>
                <RequestAccessPage />
            </Home>
        );
    }

    return (
        <Home>
            <div className={styles.loginPage}>
                <div className={styles.loginFormWrapper}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className={styles.loginForm}
                    >
                        <div className={styles.loginTitleWrapper}>
                            <div className={styles.loginTitle}>
                                Welcome {signIn && 'back'} to Highlight.
                            </div>
                            <div className={styles.loginSubTitle}>
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
                            </div>
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
                        <button
                            className={commonStyles.submitButton}
                            type="submit"
                        >
                            {signIn ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>
                    <div className={styles.otherSigninText}>
                        or sign {signIn ? 'in' : 'up'} with
                    </div>
                    <div
                        className={commonStyles.secondaryButton}
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
                    </div>
                    <div className={commonStyles.errorMessage}>
                        {firebaseError}
                    </div>
                    <div className={commonStyles.errorMessage}>
                        {JSON.stringify(error)}
                    </div>
                </div>
            </div>
        </Home>
    );
};
