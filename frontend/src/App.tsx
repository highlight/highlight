import React, { useState, useEffect } from 'react';
import './App.css';

import styles from './App.module.css';
import { client } from './util/graph';
import { Spinner } from './components/Spinner/Spinner';
import { Player } from './pages/Player/PlayerPage';
import { SetupPage } from './pages/Setup/SetupPage';
import { SessionsPage } from './pages/Sessions/SessionsPage';
import { firebaseInit } from './util/auth';
import { ReactComponent as HighlightLogo } from './static/highlight-logo.svg';
import { ReactComponent as GoogleLogo } from './static/google.svg';
import { FaUserCircle } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useQuery, gql } from '@apollo/client';
import {
    Switch,
    Route,
    BrowserRouter as Router,
    Redirect,
    Link,
} from 'react-router-dom';
import * as firebase from 'firebase/app';
import { Dropdown, Skeleton } from 'antd';

const provider = firebaseInit();

const App = () => {
    const { loading: o_loading, error: o_error, data: o_data } = useQuery(gql`
        query GetOrganizations {
            organizations {
                id
            }
        }
    `);
    if (o_error || o_loading || !o_data?.organizations?.length) {
        return (
            <div className={styles.loadingWrapper}>
                <Spinner />
            </div>
        );
    }

    const current_org = o_data?.organizations[0].id;
    return (
        <div className={styles.appBody}>
            <Router>
                <Route path="/:organization_id">
                    <Header />
                </Route>
                <Switch>
                    <Route path="/:organization_id/sessions/:session_id">
                        <div className={styles.playerPageBody}>
                            <Player />
                        </div>
                    </Route>
                    <Route path="/:organization_id/sessions">
                        <SessionsPage />
                    </Route>
                    <Route path="/:organization_id/setup">
                        <SetupPage />
                    </Route>
                    <Route path="/">
                        <Redirect to={`/${current_org}/setup`} />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
};

export const AuthAdminRouter = () => {
    const { loading, error, data } = useQuery<{
        admin: { id: string; name: string; email: string };
    }>(gql`
        query GetAdmin {
            admin {
                id
                name
                email
            }
        }
    `);
    const admin = data?.admin;
    useEffect(() => {
        if (admin) {
            const { email, id, name } = admin;
            window.H.identify(email, { id, name });
            window.analytics.identify(id, {
                name,
                email,
            });
        }
    }, [admin]);
    if (error || loading) {
        return (
            <div className={styles.loadingWrapper}>
                <Spinner />
            </div>
        );
    }
    return <App />;
};

type Inputs = {
    email: string;
    password: string;
};

export const AuthAppRouter = () => {
    const { watch, register, handleSubmit, errors, reset, setError } = useForm<
        Inputs
    >();
    const [signIn, setSignIn] = useState<boolean>(true);
    const [firebaseError, setFirebaseError] = useState(undefined);
    const [user, loading, error] = useAuthState(firebase.auth());
    const googleLogin = async (e: React.MouseEvent<HTMLDivElement>) => {
        await e.preventDefault();
        await firebase
            .auth()
            .signInWithRedirect(provider)
            .catch((e) => setFirebaseError(e));
    };
    const onSubmit = (data: Inputs) => {
        firebase
            .auth()
            .createUserWithEmailAndPassword(data.email, data.password)
            .catch((error) => {
                setError('password', {
                    type: 'manual',
                    message: error.toString(),
                });
            });
    };

    const changeState = () => {
        setSignIn(!signIn);
        reset();
    };

    if (loading) {
        return (
            <div className={styles.loadingWrapper}>
                <Spinner />
            </div>
        );
    }

    if (user) {
        return <AuthAdminRouter />;
    }

    return (
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
                                        className={styles.loginStateSwitcher}
                                    >
                                        Create an account.
                                    </span>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <span
                                        onClick={changeState}
                                        className={styles.loginStateSwitcher}
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
                        className={styles.loginInput}
                    />
                    <div className={styles.errorMessage}>
                        {errors.email && 'Enter an email yo!'}
                    </div>
                    <input
                        placeholder={'Password'}
                        type="password"
                        name="password"
                        ref={register({ required: true })}
                        className={styles.loginInput}
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
                                                message: 'Mismatched passwords',
                                            });
                                            return "Passwords don't match.";
                                        }
                                    },
                                })}
                                className={styles.loginInput}
                            />
                        </>
                    )}
                    <div className={styles.errorMessage}>
                        {errors.password && errors.password.message}
                    </div>
                    <button className={styles.submitButton} type="submit">
                        {signIn ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>
                <div className={styles.otherSigninText}>
                    or sign {signIn ? 'in' : 'up'} with
                </div>
                <div className={styles.googleButton} onClick={googleLogin}>
                    <GoogleLogo className={styles.googleLogoStyle} />
                    <span className={styles.googleText}>
                        Google Sign {signIn ? 'In' : 'Up'}
                    </span>
                </div>
                <div className={styles.errorMessage}>
                    {JSON.stringify(firebaseError)}
                </div>
                <div className={styles.errorMessage}>
                    {JSON.stringify(error)}
                </div>
            </div>
        </div>
    );
};

const Header = () => {
    const { organization_id } = useParams();
    const { loading: a_loading, error: a_error, data: a_data } = useQuery<{
        admin: { id: string; name: string; email: string };
    }>(gql`
        query GetAdmin {
            admin {
                id
                name
                email
            }
        }
    `);
    const menu = (
        <div className={styles.dropdownMenu}>
            <div className={styles.dropdownInner}>
                {a_loading || a_error ? (
                    <Skeleton />
                ) : (
                    <div>
                        <div className={styles.dropdownName}>
                            {a_data?.admin.name}
                        </div>
                        <div className={styles.dropdownEmail}>
                            {a_data?.admin.email}
                        </div>
                        <div
                            className={styles.dropdownLogout}
                            onClick={async () => {
                                try {
                                    firebase.auth().signOut();
                                } catch (e) {
                                    console.log(e);
                                }
                                client.cache.reset();
                            }}
                        >
                            <FiLogOut />
                            <span className={styles.dropdownLogoutText}>
                                Logout
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className={styles.header}>
            <div className={styles.logoWrapper}>
                <HighlightLogo className={styles.logo} />
            </div>
            <div className={styles.rightHeader}>
                <Link
                    onClick={() => {
                        window.analytics.track('Sessions Click', {});
                    }}
                    to={`/${organization_id}/sessions`}
                    className={styles.headerLink}
                >
                    Sessions
                </Link>
                <Link
                    onClick={() => {
                        window.analytics.track('Setup Click', {});
                    }}
                    to={`/${organization_id}/setup`}
                    className={styles.headerLink}
                >
                    Setup
                </Link>
                <Dropdown
                    overlay={menu}
                    placement={'bottomRight'}
                    arrow
                    onVisibleChange={() => {
                        window.analytics.track('User Icon Hover', {});
                    }}
                >
                    <div className={styles.accountIconWrapper}>
                        <FaUserCircle className={styles.accountIcon} />
                    </div>
                </Dropdown>
            </div>
        </div>
    );
};

export default App;
