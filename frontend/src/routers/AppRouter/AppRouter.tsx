import '../../App.scss';

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
    BrowserRouter as Router,
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';

import { LoadingPage } from '../../components/Loading/Loading';
import { useGetOrganizationsQuery } from '../../graph/generated/hooks';
import { Landing } from '../../pages/Landing/Landing';
import NewMemberPage from '../../pages/NewMember/NewMemberPage';
import NewWorkspacePage from '../../pages/NewWorkspace/NewWorkspacePage';
import { auth } from '../../util/auth';
import InternalRouter from '../InternalRouter/InternalRouter';
import { OrgRouter } from '../OrgRouter/OrgRouter';
import styles from './AppRouter.module.scss';

export const AppRouter = () => {
    const [user] = useAuthState(auth);
    const {
        loading: o_loading,
        error: o_error,
        data: o_data,
    } = useGetOrganizationsQuery({ skip: !user });

    if (user) {
        if (o_error) {
            return <p>{'App error: ' + JSON.stringify(o_error)}</p>;
        }

        if (o_error || o_loading) {
            return <LoadingPage />;
        }
    }

    return (
        <div className={styles.appBody}>
            <Router>
                <Switch>
                    <Route path="/:organization_id/invite/:invite_id">
                        <Landing>
                            <NewMemberPage />
                        </Landing>
                    </Route>
                    <Route path="/new">
                        <Landing>
                            <NewWorkspacePage />
                        </Landing>
                    </Route>
                    <Route path="/_internal">
                        <InternalRouter />
                    </Route>
                    <Route path="/:organization_id">
                        <OrgRouter />
                    </Route>
                    <Route path="/">
                        <Redirect
                            to={
                                o_data?.organizations?.length
                                    ? `/${o_data?.organizations[0]?.id}`
                                    : `/new`
                            }
                        />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
};
