import { getSlackUrl } from '@components/Header/components/PersonalNotificationButton/utils/utils';
import { useGetAlertsPagePayloadQuery } from '@graph/hooks';
import { GetAlertsPagePayloadQuery } from '@graph/operations';
import AlertsPage from '@pages/Alerts/Alerts';
import { AlertsContextProvider } from '@pages/Alerts/AlertsContext/AlertsContext';
import EditAlertsPage from '@pages/Alerts/EditAlertsPage';
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
    const slackUrl = getSlackUrl('Organization', project_id, 'alerts');

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
                slackUrl,
            }}
        >
            <Switch>
                <Route exact path={path}>
                    <AlertsPage />
                </Route>
                <Route path={`${path}/new`}>
                    <EditAlertsPage isEditing={false} />
                </Route>
                <Route path={`${path}/:id`}>
                    <EditAlertsPage isEditing={true} />
                </Route>
            </Switch>
        </AlertsContextProvider>
    );
};

export default AlertsRouter;
