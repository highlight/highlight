import '../../App.scss';

import loadable from '@loadable/component';
import React from 'react';
import {
    BrowserRouter as Router,
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';

import { LoadingPage } from '../../components/Loading/Loading';
import { useGetOrganizationsQuery } from '../../graph/generated/hooks';
import { Landing } from '../../pages/Landing/Landing';
import InternalRouter from '../InternalRouter/InternalRouter';
import { OrgRouter } from '../OrgRouter/OrgRouter';
import styles from './AppRouter.module.scss';

const NewMemberPage = loadable(
    () => import('../../pages/NewMember/NewMemberPage')
);
const NewWorkspacePage = loadable(
    () => import('../../pages/NewWorkspace/NewWorkspacePage')
);

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
