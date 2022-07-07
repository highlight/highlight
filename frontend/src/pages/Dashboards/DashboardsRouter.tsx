import Breadcrumb from '@components/Breadcrumb/Breadcrumb';
import LeadAlignLayout from '@components/layout/LeadAlignLayout';
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
import moment from 'moment';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';

const DashboardsRouter = () => {
    const [dateRange, setDateRange] = React.useState<{
        start_date: string;
        end_date: string;
    }>();
    const [lookbackMinutes, setLookbackMinutes] = React.useState<number>(15);
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

    useEffect(() => {
        if (dateRange?.start_date && dateRange.end_date) {
            const start = moment(dateRange.start_date);
            const end = moment(dateRange.end_date);
            const minutes = moment.duration(end.diff(start)).asMinutes();

            // debugger;
            // setLookbackMinutes(minutes);
        }
    }, [dateRange?.start_date, dateRange?.end_date]);

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
                dateRange,
                setDateRange: (start, end) => {
                    const startDate = moment(start);
                    const endDate = moment(end);
                    const minutesDiff = moment
                        .duration(endDate.diff(startDate))
                        .asMinutes();

                    const roundedEnd = roundDate(
                        endDate,
                        Math.min(15, minutesDiff)
                    );
                    const roundedStart = roundDate(
                        startDate,
                        Math.min(15, minutesDiff)
                    );

                    setDateRange({
                        start_date: moment(startDate)
                            .subtract(minutesDiff, 'minutes')
                            .format('YYYY-MM-DDTHH:mm:00.000000000Z'),
                        end_date: endDate.format(
                            'YYYY-MM-DDTHH:mm:59.999999999Z'
                        ),
                    });

                    setLookbackMinutes(minutesDiff);
                },
                lookbackMinutes,
            }}
        >
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

export const roundDate = (d: moment.Moment, toMinutes: number) => {
    const remainder = toMinutes - (d.minute() % toMinutes);
    return d.add(remainder, 'minutes');
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
