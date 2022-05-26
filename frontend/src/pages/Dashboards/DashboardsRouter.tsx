import Breadcrumb from '@components/Breadcrumb/Breadcrumb';
import LeadAlignLayout from '@components/layout/LeadAlignLayout';
import { useGetWorkspaceAdminsByProjectIdQuery } from '@graph/hooks';
import { DashboardsContextProvider } from '@pages/Dashboards/DashboardsContext/DashboardsContext';
import DashboardPage from '@pages/Dashboards/pages/Dashboard/DashboardPage';
import DashboardsHomePage from '@pages/Dashboards/pages/DashboardsHomePage/DashboardsHomePage';
import { useParams } from '@util/react-router/useParams';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';

const DashboardsRouter = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { path } = useRouteMatch();
    const { loading, data } = useGetWorkspaceAdminsByProjectIdQuery({
        variables: { project_id },
    });
    const history = useHistory<{ errorName: string }>();
    const [dashboards, setDashboards] = useState<any[]>([]);

    useEffect(() => {
        if (!loading) {
            setDashboards([
                {
                    id: 1,
                    name: 'Web Vitals',
                    updated_at: '2021-12-29T13:05:13.997412-08:00',
                    LastAdminToEditID: '0',
                    allAdmins: data?.admins || [],
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
