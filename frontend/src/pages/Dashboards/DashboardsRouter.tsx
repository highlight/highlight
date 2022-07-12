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
import useLocalStorage from '@rehooks/local-storage';
import { useParams } from '@util/react-router/useParams';
import moment from 'moment';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';

export const timeFilters = [
    { label: 'Last 1 minute', value: 1 },
    { label: 'Last 15 minutes', value: 15 },
    { label: 'Last 1 hours', value: 60 },
    { label: 'Last 6 hours', value: 6 * 60 },
    { label: 'Last 24 hours', value: 24 * 60 },
    { label: 'Last 7 days', value: 7 * 24 * 60 },
    { label: 'Last 30 days', value: 30 * 24 * 60 },
] as { label: string; value: number }[];

const DashboardsRouter = () => {
    const { project_id, id } = useParams<{ project_id: string; id: string }>();
    const { path } = useRouteMatch();
    console.log(project_id, id);
    const [dateRangeLength, setDateRangeLength] = useLocalStorage(
        `highlight-dashboard-${project_id}-${id}-date-range-v2`,
        timeFilters[1]
    );
    const [dateRange, setDateRange] = React.useState<{
        start_date: string;
        end_date: string;
        custom: boolean;
    }>({
        start_date: moment()
            .subtract(dateRangeLength.value, 'minutes')
            .format(),
        end_date: moment().format(),
        custom: false,
    });
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
                setDateRange: (start, end, custom) => {
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
                        start_date: moment(roundedStart).format(
                            'YYYY-MM-DDTHH:mm:00.000000000Z'
                        ),
                        end_date: roundedEnd.format(
                            'YYYY-MM-DDTHH:mm:59.999999999Z'
                        ),
                        custom,
                    });
                },
                getLookbackMinutes: () => {
                    const start = moment(dateRange.start_date);
                    const end = moment(dateRange.end_date);

                    return Math.floor(
                        moment.duration(end.diff(start)).asMinutes()
                    );
                },
                setDateRangeLength,
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
