import React, { useState, useEffect } from 'react';
import './App.css';

import styles from './App.module.css';
import commonStyles from './Common.module.css';
import { Spinner, CircularSpinner } from './components/Spinner/Spinner';
import { Player } from './pages/Player/PlayerPage';
import { SetupPage } from './pages/Setup/SetupPage';
import { NewMemberPage } from './pages/NewMember/NewMemberPage';
import { NewWorkspacePage } from './pages/NewWorkspace/NewWorkspacePage';
import { SessionsPage } from './pages/Sessions/SessionsPage';
import { auth, googleProvider } from './util/auth';
import { ReactComponent as GoogleLogo } from './static/google.svg';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useQuery, gql } from '@apollo/client';
import {
    Switch,
    Route,
    BrowserRouter as Router,
    Redirect,
} from 'react-router-dom';
import { H } from 'highlight.run';
import { Header } from './components/Header/Header';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

H.init(3, true);
Sentry.init({
    dsn:
        'https://47f7bc7301cc470799f71a21f1623a34@o473684.ingest.sentry.io/5508861',
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
});
H.getSessionURL().then((url) => {
    Sentry.setContext('highlight', { highlightURL: url });
});

const App = () => {
    const { loading: o_loading, error: o_error, data: o_data } = useQuery(gql`
        query GetOrganizations {
            organizations {
                id
            }
        }
    `);

    if (o_error) {
        return <p>{'App error: ' + JSON.stringify(o_error)}</p>;
    }

    if (o_error || o_loading) {
        return (
            <div className={styles.loadingWrapper}>
                <Spinner />
            </div>
        );
    }

    return (
        <div className={styles.appBody}>
            <Router>
                {!o_data.organizations.length ? (
                    <NewWorkspacePage />
                ) : (
                    <Switch>
                        <Route path="/:organization_id/invite/:invite_id">
                            <NewMemberPage />
                        </Route>
                        <Route path="/new">
                            <NewWorkspacePage />
                        </Route>
                        <Route path="/:organization_id">
                            <OrgValidator />
                        </Route>
                        <Route path="/">
                            <Redirect
                                to={`/${o_data?.organizations[0].id}/setup`}
                            />
                        </Route>
                    </Switch>
                )}
            </Router>
        </div>
    );
};

const OrgValidator = () => {
    const { organization_id } = useParams();
    const { loading, error, data } = useQuery<
        { organization: { name: string } },
        { id: number }
    >(
        gql`
            query GetOrganization($id: ID!) {
                organization(id: $id) {
                    name
                }
            }
        `,
        { variables: { id: organization_id } }
    );
    if (error) {
        return <p>{'OrgValidator error: ' + JSON.stringify(error)}</p>;
    }
    if (loading || !data?.organization) {
        return <CircularSpinner />;
    }
    return (
        <>
            <Header />
            <Switch>
                <Route path="/:organization_id/sessions/:session_id">
                    <Player />
                </Route>
                <Route path="/:organization_id/sessions">
                    <SessionsPage />
                </Route>
                <Route path="/:organization_id">
                    <SetupPage />
                </Route>
            </Switch>
        </>
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
            H.identify(email, { id, name });
            H.getSessionURL().then((e) => console.log(e));
            window.analytics.identify(id, {
                name,
                email,
            });
        }
    }, [admin]);
    if (error) {
        return <p>{'AuthAdminRouter error: ' + JSON.stringify(error)}</p>;
    }
    if (loading) {
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
                                                message: 'Mismatched passwords',
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
                    <button className={commonStyles.submitButton} type="submit">
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
                <div className={commonStyles.errorMessage}>{firebaseError}</div>
                <div className={commonStyles.errorMessage}>
                    {JSON.stringify(error)}
                </div>
            </div>
        </div>
    );
};

export default App;
