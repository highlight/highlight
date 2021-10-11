import { useGetAlertsPagePayloadQuery } from '@graph/hooks';
import { GetAlertsPagePayloadQuery } from '@graph/operations';
import AlertsPage from '@pages/Alerts/Alerts';
import { AlertsContextProvider } from '@pages/Alerts/AlertsContext/AlertsContext';
import NewAlertsPage from '@pages/Alerts/NewAlertsPage';
import { useParams } from '@util/react-router/useParams';
import React, { useEffect, useState } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

const AlertsRouter = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { path } = useRouteMatch();
    const [alertsPayload, setAlertsPayload] = useState<
        GetAlertsPagePayloadQuery | undefined
    >(undefined);
    const { data, loading } = useGetAlertsPagePayloadQuery({
        variables: { project_id },
    });

    useEffect(() => {
        if (!loading) {
            setAlertsPayload(data);
        }
    }, [data, loading]);

    return (
        <AlertsContextProvider
            value={{
                alertsPayload,
                setAlertsPayload,
                loading,
            }}
        >
            <Switch>
                <Route exact path={path}>
                    <AlertsPage />
                </Route>
                <Route path={`${path}/new`}>
                    <NewAlertsPage />
                </Route>
                <Route path={`${path}/:id`}>
                    <h2>Edit</h2>
                </Route>
            </Switch>
        </AlertsContextProvider>
    );
};

export default AlertsRouter;
