import AlertsPage from '@pages/Alerts/Alerts';
import NewAlertsPage from '@pages/Alerts/NewAlertsPage';
import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

const AlertsRouter = () => {
    const { path, url } = useRouteMatch();

    return (
        <Switch>
            <Route exact path={path}>
                <AlertsPage />
            </Route>
            <Route exact path={`${path}/new`}>
                <NewAlertsPage />
            </Route>
            <Route path={`${path}/:id`}>
                <h2>Edit</h2>
            </Route>
        </Switch>
    );
};

export default AlertsRouter;
