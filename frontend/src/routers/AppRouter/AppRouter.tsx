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
import { Home } from '../../pages/Home/Home';

export const AppRouter = () => {
    const { error: o_error, data: o_data } = useGetOrganizationsQuery();

    if (o_error) {
        return <p>{'App error: ' + JSON.stringify(o_error)}</p>;
    }

    if (o_error) {
        return <LoadingPage />;
    }

    return (
        <div className={styles.appBody}>
            <Router>
                <Switch>
                    <Route path="/:organization_id/invite/:invite_id">
                        <Home>
                            <NewMemberPage />
                        </Home>
                    </Route>
                    <Route path="/new">
                        <Home>
                            <NewWorkspacePage />
                        </Home>
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
