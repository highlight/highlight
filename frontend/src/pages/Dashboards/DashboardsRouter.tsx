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
import HomePage from '@pages/Home/HomePage';
import {
    DEFAULT_HOME_DASHBOARD_LAYOUT,
    HOME_DASHBOARD_CONFIGURATION,
} from '@pages/Home/utils/HomePageUtils';
import { WEB_VITALS_CONFIGURATION } from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import { useParams } from '@util/react-router/useParams';
import { H } from 'highlight.run';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

const DashboardsRouter = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { path } = useRouteMatch();
    const { data: adminsData } = useGetWorkspaceAdminsByProjectIdQuery({
        variables: { project_id },
    });
    const { data, loading, error } = useGetDashboardDefinitionsQuery({
        variables: { project_id },
    });
    const [upsertDashboardMutation] = useUpsertDashboardMutation({
        refetchQueries: [namedOperations.Query.GetDashboardDefinitions],
    });

    useEffect(() => {
        // create default dashboards
        if (
            project_id &&
            !loading &&
            !error &&
            data?.dashboard_definitions?.length
        ) {
            if (
                !data?.dashboard_definitions?.filter(
                    (d) => d?.name === 'Web Vitals'
                )?.length
            ) {
                upsertDashboardMutation({
                    variables: {
                        project_id,
                        metrics: Object.values(WEB_VITALS_CONFIGURATION),
                        name: 'Web Vitals',
                        layout: JSON.stringify(DEFAULT_METRICS_LAYOUT),
                    },
                }).catch(H.consumeError);
            }
            if (
                !data?.dashboard_definitions?.filter((d) => d?.name === 'Home')
                    ?.length
            ) {
                upsertDashboardMutation({
                    variables: {
                        project_id,
                        metrics: Object.values(HOME_DASHBOARD_CONFIGURATION),
                        name: 'Home',
                        layout: JSON.stringify(DEFAULT_HOME_DASHBOARD_LAYOUT),
                    },
                }).catch(H.consumeError);
            }
        }
    }, [project_id, upsertDashboardMutation, loading, error, data]);

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
                <Route exact path={`/:project_id/home`}>
                    <HomePage />
                </Route>
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
