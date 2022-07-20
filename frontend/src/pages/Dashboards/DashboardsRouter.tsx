import {
    useGetDashboardDefinitionsQuery,
    useGetWorkspaceAdminsByProjectIdQuery,
    useUpsertDashboardMutation,
} from '@graph/hooks';
import { namedOperations } from '@graph/operations';
import { DashboardsContextProvider } from '@pages/Dashboards/DashboardsContext/DashboardsContext';
import { DEFAULT_METRICS_LAYOUT } from '@pages/Dashboards/Metrics';
import DashboardPage from '@pages/Dashboards/pages/Dashboard/DashboardPage';
import DashboardsHomePage from '@pages/Dashboards/pages/DashboardsHomePage/DashboardsHomePage';
import { WEB_VITALS_CONFIGURATION } from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import { useParams } from '@util/react-router/useParams';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';

const DashboardsRouter = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { path } = useRouteMatch();
    const { data: adminsData } = useGetWorkspaceAdminsByProjectIdQuery({
        variables: { project_id },
    });
    const { data, loading } = useGetDashboardDefinitionsQuery({
        variables: { project_id },
    });
    const [upsertDashboardMutation] = useUpsertDashboardMutation({
        refetchQueries: [namedOperations.Query.GetDashboardDefinitions],
    });
    const history = useHistory<{ errorName: string }>();

    useEffect(() => {
        // if no dashboards exist, create a web vitals dashboard by default
        if (!loading && !data?.dashboard_definitions?.length) {
            upsertDashboardMutation({
                variables: {
                    project_id,
                    metrics: Object.values(WEB_VITALS_CONFIGURATION),
                    name: 'Web Vitals',
                    layout: JSON.stringify(DEFAULT_METRICS_LAYOUT),
                },
            });
        }
    }, [project_id, upsertDashboardMutation, loading, data]);

    return (
        <DashboardsContextProvider
            value={{
                allAdmins: adminsData?.admins || [],
                dashboards: data?.dashboard_definitions || [],
                updateDashboard: ({ id, name, metrics, layout }) => {
                    return upsertDashboardMutation({
                        variables: {
                            id,
                            project_id,
                            metrics,
                            name,
                            layout,
                        },
                    });
                },
            }}
        >
            <Helmet>
                <title>Dashboards</title>
            </Helmet>
            <Switch>
                <Route exact path={path}>
                    <DashboardsHomePage />
                </Route>
                <Route path={`${path}/:id`}>
                    <DashboardPage />
                </Route>
            </Switch>
        </DashboardsContextProvider>
    );
};

export default DashboardsRouter;
