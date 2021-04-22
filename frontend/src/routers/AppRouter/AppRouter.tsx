import React from 'react';
import '../../App.scss';

import styles from './AppRouter.module.scss';
import { LoadingPage } from '../../components/Loading/Loading';
import { NewMemberPage } from '../../pages/NewMember/NewMemberPage';
import { NewWorkspacePage } from '../../pages/NewWorkspace/NewWorkspacePage';
import {
    Switch,
    Route,
    BrowserRouter as Router,
    Redirect,
} from 'react-router-dom';
import { OrgRouter } from '../OrgRouter/OrgRouter';
import { useGetOrganizationsQuery } from '../../graph/generated/hooks';
import { Landing } from '../../pages/Landing/Landing';
import InternalRouter from '../InternalRouter/InternalRouter';

export const AppRouter = () => {
    const {
        loading: o_loading,
        error: o_error,
        data: o_data,
    } = useGetOrganizationsQuery();

    if (o_error) {
        return <p>{'App error: ' + JSON.stringify(o_error)}</p>;
    }

    if (o_error || o_loading) {
        return <LoadingPage />;
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
