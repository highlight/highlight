import Breadcrumb from '@components/Breadcrumb/Breadcrumb';
import { getSlackUrl } from '@components/Header/components/PersonalNotificationButton/utils/utils';
import LeadAlignLayout from '@components/layout/LeadAlignLayout';
import { useGetAlertsPagePayloadQuery } from '@graph/hooks';
import { GetAlertsPagePayloadQuery } from '@graph/operations';
import AlertsPage from '@pages/Alerts/Alerts';
import { AlertsContextProvider } from '@pages/Alerts/AlertsContext/AlertsContext';
import EditAlertsPage from '@pages/Alerts/EditAlertsPage';
import { useParams } from '@util/react-router/useParams';
import React, { useEffect, useState } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';

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
    const history = useHistory<{ errorName: string }>();

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
            <LeadAlignLayout>
                <Breadcrumb
                    getBreadcrumbName={(url) =>
                        getAlertsBreadcrumbNames(history.location.state)(url)
                    }
                    linkRenderAs="h2"
                />
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
            </LeadAlignLayout>
        </AlertsContextProvider>
    );
};

export default AlertsRouter;

const getAlertsBreadcrumbNames = (suffixes: { [key: string]: string }) => {
    return (url: string) => {
        if (url.endsWith('/alerts')) {
            return 'Alerts';
        }

        if (url.endsWith('/alerts/new')) {
            return 'Create New Alert';
        }
        return `Edit ${suffixes?.errorName}`;
    };
};
