import Breadcrumb from '@components/Breadcrumb/Breadcrumb';
import LeadAlignLayout from '@components/layout/LeadAlignLayout';
import { useGetWorkspaceAdminsByProjectIdQuery } from '@graph/hooks';
import { DashboardsContextProvider } from '@pages/Dashboards/DashboardsContext/DashboardsContext';
import DashboardPage from '@pages/Dashboards/pages/Dashboard/DashboardPage';
import DashboardsHomePage from '@pages/Dashboards/pages/DashboardsHomePage/DashboardsHomePage';
import { WEB_VITALS_CONFIGURATION } from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import { useParams } from '@util/react-router/useParams';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';

export interface Dashboard {
    id: number;
    name: string;
    updated_at: string;
    LastAdminToEditID: string;
    metrics: readonly string[];
    metricConfigs: { [key in string]: any };
    loading: boolean;
    allAdmins?: any;
}

const DashboardsRouter = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { path } = useRouteMatch();
    const { loading, data } = useGetWorkspaceAdminsByProjectIdQuery({
        variables: { project_id },
    });
    const history = useHistory<{ errorName: string }>();
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);

    useEffect(() => {
        if (!loading) {
            setDashboards([
                {
                    id: 1,
                    name: 'Web Vitals',
                    updated_at: '2021-12-29T13:05:13.997412-08:00',
                    LastAdminToEditID: '0',
                    allAdmins: data?.admins || [],
                    metrics: ['CLS', 'FCP', 'FID', 'LCP', 'TTFB'] as const,
                    metricConfigs: WEB_VITALS_CONFIGURATION,
                    loading,
                },
                {
                    id: 2,
                    name: 'Backend Latency',
                    updated_at: '2022-05-20T13:05:13.997412-08:00',
                    LastAdminToEditID: '0',
                    allAdmins: data?.admins || [],
                    metrics: ['delayMS'] as const,
                    metricConfigs: {
                        delayMS: {
                            maxGoodValue: 0.1,
                            name: 'Backend Handler Delay',
                            maxNeedsImprovementValue: 0.25,
                            poorValue: 0,
                            units: 'ms',
                            helpArticle: '',
                        },
                    },
                    loading,
                },
            ]);
        }
    }, [data?.admins, loading]);

    return (
        <DashboardsContextProvider value={{ dashboards, setDashboards }}>
            <Helmet>
                <title>Dashboards</title>
            </Helmet>
            <LeadAlignLayout fullWidth>
                <Breadcrumb
                    getBreadcrumbName={(url) =>
                        getDashboardsBreadcrumbNames(history.location.state)(
                            url
                        )
                    }
                    linkRenderAs="h2"
                />
                <Switch>
                    <Route exact path={path}>
                        <DashboardsHomePage />
                    </Route>
                    <Route path={`${path}/:id`}>
                        <DashboardPage />
                    </Route>
                </Switch>
            </LeadAlignLayout>
        </DashboardsContextProvider>
    );
};

export default DashboardsRouter;

const getDashboardsBreadcrumbNames = (suffixes: { [key: string]: string }) => {
    return (url: string) => {
        if (url.endsWith('/dashboards')) {
            return 'Dashboards';
        }

        return `${suffixes?.dashboardName}`;
    };
};
