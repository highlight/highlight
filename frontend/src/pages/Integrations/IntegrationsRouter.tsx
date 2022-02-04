import IntegrationsPage from '@pages/Integrations/IntegrationsPage';
import NewIntegrationPage from '@pages/Integrations/NewIntegrationPage';
import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

const IntegrationsRouter = () => {
    const { path } = useRouteMatch();

    return (
        <Switch>
            <Route exact path={path}>
                <IntegrationsPage />
            </Route>
            <Route exact path={path}>
                <IntegrationsPage />
            </Route>
            <Route exact path={`${path}/:integrationName`}>
                <NewIntegrationPage />
            </Route>
        </Switch>
    );
};

export default IntegrationsRouter;
