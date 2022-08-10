import Card from '@components/Card/Card';
import DemoWorkspaceButton, {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { RechartTooltip } from '@components/recharts/RechartTooltip/RechartTooltip';
import {
    useGetAdminQuery,
    useGetDailyErrorsCountQuery,
    useGetDailySessionsCountQuery,
} from '@graph/hooks';
import DashboardPage from '@pages/Dashboards/pages/Dashboard/DashboardPage';
import { dailyCountData } from '@util/dashboardCalculations';
import { useIntegrated } from '@util/integrated';
import { formatNumber } from '@util/numbers';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import Lottie from 'lottie-react';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Skeleton from 'react-loading-skeleton';
import { Link, useHistory } from 'react-router-dom';
import {
    Area,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from 'recharts';

import ElevatedCard from '../../components/ElevatedCard/ElevatedCard';
import WaitingAnimation from '../../lottie/waiting.json';
import { SessionPageSearchParams } from '../Player/utils/utils';
import { EmptySessionsSearchParams } from '../Sessions/EmptySessionsSearchParams';
import { useSearchContext } from '../Sessions/SearchContext/SearchContext';
import {
    HomePageFiltersContext,
    useHomePageFiltersContext,
} from './components/HomePageFilters/HomePageFiltersContext';
import styles from './HomePage.module.scss';

type DailyCount = {
    date: string;
    count: number;
    label: string;
};

const HomePage = () => {
    const { loading: adminLoading, data: adminData } = useGetAdminQuery({
        skip: false,
    });
    const { project_id } = useParams<{ project_id: string }>();
    const projectIdRemapped =
        project_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : project_id;
    const [dateRangeLength, setDateRangeLength] = useState<number>(
        timeFilter[1].value
    );
    const [hasData, setHasData] = useState<boolean>(true);
    const { integrated, loading: integratedLoading } = useIntegrated();

    if (integratedLoading || adminLoading) {
        return null;
    }

    return (
        <HomePageFiltersContext
            value={{ dateRangeLength, setDateRangeLength, hasData, setHasData }}
        >
            <Helmet>
                <title>Home</title>
            </Helmet>
            <div className={styles.dashboardWrapper}>
                <div className={styles.dashboard}>
                    <div className={styles.dashboardBody}>
                        <DashboardPage
                            header={
                                <div>
                                    <h2>
                                        {integrated
                                            ? `${
                                                  adminData?.admin?.name
                                                      ? `Hey ${
                                                            adminData.admin.name.split(
                                                                ' '
                                                            )[0]
                                                        }, welcome`
                                                      : `Welcome`
                                              } back to Highlight.`
                                            : 'Welcome to Highlight'}
                                    </h2>
                                </div>
                            }
                            lookbackDays={dateRangeLength}
                            onChangeLookbackDays={setDateRangeLength}
                            dashboardName={'Home'}
                        />
                    </div>
                    {!hasData && !integrated && (
                        <div className={styles.noDataContainer}>
                            <ElevatedCard
                                title={
                                    integrated
                                        ? "You're too fast!"
                                        : 'Waiting for Installation...'
                                }
                                animation={
                                    <Lottie animationData={WaitingAnimation} />
                                }
                            >
                                <p>
                                    {integrated ? (
                                        "We're still processing your sessions and errors. Check back here later."
                                    ) : (
                                        <>
                                            Please follow the{' '}
                                            <Link
                                                to={`/${projectIdRemapped}/setup`}
                                            >
                                                setup instructions
                                            </Link>{' '}
                                            to install Highlight. It should take
                                            less than a minute for us to detect
                                            installation.
                                            <div
                                                className={
                                                    styles.demoWorkspaceButton
                                                }
                                            >
                                                <DemoWorkspaceButton
                                                    integrated={integrated}
                                                />
                                            </div>
                                        </>
                                    )}
                                </p>
                            </ElevatedCard>
                        </div>
                    )}
                </div>
            </div>
        </HomePageFiltersContext>
    );
};

const timeFilter = [
    { label: 'Last 24 hours', value: 2 },
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
    { label: 'This year', value: 30 * 12 },
] as const;

export const SessionCountGraph = () => {
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const projectIdRemapped =
        project_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : project_id;

    const {
        setSearchParams,
        setSegmentName,
        setSelectedSegment,
    } = useSearchContext();
    const { dateRangeLength, setHasData } = useHomePageFiltersContext();
    const [sessionCountData, setSessionCountData] = useState<Array<DailyCount>>(
        []
    );
    const history = useHistory();

    const { loading, refetch } = useGetDailySessionsCountQuery({
        variables: {
            project_id,
            date_range: {
                start_date: moment
                    .utc()
                    .subtract(dateRangeLength, 'd')
                    .startOf('day'),
                end_date: moment.utc().startOf('day'),
            },
        },
        onCompleted: (response) => {
            if (response.dailySessionsCount) {
                setHasData(response.dailySessionsCount.length > 0);
                const dateRangeData = dailyCountData(
                    response.dailySessionsCount,
                    dateRangeLength
                );
                const sessionCounts = dateRangeData.map((val, idx) => ({
                    date: moment()
                        .utc()
                        .startOf('day')
                        .subtract(dateRangeLength - 1 - idx, 'days')
                        .format('D MMM YYYY'),
                    count: val,
                    label: 'sessions',
                }));
                setSessionCountData(sessionCounts);
            }
        },
    });

    // Refetch when the project changes to handle the scenario where a user is a part of multiple projects.
    // Without this, the data shown would be for the previous project.
    useEffect(() => {
        refetch();
    }, [refetch, project_id]);

    return loading ? (
        <Skeleton count={1} style={{ width: '100%', height: 334 }} />
    ) : (
        <Card title="Sessions per Day" full>
            <DailyChart
                data={sessionCountData}
                name="Sessions"
                onClickHandler={(payload: any) => {
                    const date = moment(payload.activeLabel);
                    setSegmentName(null);
                    setSelectedSegment(undefined);
                    setSearchParams({
                        ...EmptySessionsSearchParams,
                        date_range: {
                            start_date: date.startOf('day').toDate(),
                            end_date: date.endOf('day').toDate(),
                        },
                    });

                    message.success(
                        `Showing sessions that were recorded on ${payload.activeLabel}`
                    );
                    history.push(`/${projectIdRemapped}/sessions`);
                }}
            />
        </Card>
    );
};

export const ErrorCountGraph = () => {
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const projectIdRemapped =
        project_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : project_id;

    const { dateRangeLength } = useHomePageFiltersContext();
    const [errorCountData, setErrorCountData] = useState<Array<DailyCount>>([]);
    const history = useHistory();

    const { loading } = useGetDailyErrorsCountQuery({
        variables: {
            project_id,
            date_range: {
                start_date: moment
                    .utc()
                    .subtract(dateRangeLength, 'd')
                    .startOf('day'),
                end_date: moment.utc().startOf('day'),
            },
        },
        onCompleted: (response) => {
            if (response.dailyErrorsCount) {
                const dateRangeData = dailyCountData(
                    response.dailyErrorsCount,
                    dateRangeLength
                );
                const errorCounts = dateRangeData.map((val, idx) => ({
                    date: moment()
                        .utc()
                        .startOf('day')
                        .subtract(dateRangeLength - 1 - idx, 'days')
                        .format('D MMM YYYY'),
                    count: val,
                    label: 'errors',
                }));
                setErrorCountData(errorCounts);
            }
        },
    });

    return loading ? (
        <Skeleton count={1} style={{ width: '100%', height: 334 }} />
    ) : (
        <Card title="Errors per Day" full>
            <DailyChart
                data={errorCountData}
                lineColor={'var(--color-orange-400)'}
                name="Errors"
                onClickHandler={(payload: any) => {
                    history.push(
                        `/${projectIdRemapped}/errors?${SessionPageSearchParams.date}=${payload.activeLabel}`
                    );
                }}
            />
        </Card>
    );
};

const DailyChart = ({
    data,
    lineColor = 'var(--color-purple)',
    name,
    onClickHandler,
}: {
    data: Array<DailyCount>;
    lineColor?: string;
    name: string;
    onClickHandler?: any;
}) => {
    const gridColor = 'none';
    const labelColor = 'var(--color-gray-500)';

    const gradientId = `${name}-colorUv`;

    return (
        <ResponsiveContainer width="100%" height={275}>
            <ComposedChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: 0,
                }}
                onClick={(payload: any) => {
                    if (onClickHandler) {
                        onClickHandler(payload);
                    }
                }}
                className={styles.composedChart}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor={lineColor}
                            stopOpacity={0.2}
                        />
                        <stop
                            offset="95%"
                            stopColor="var(--color-primary-background)"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid stroke={gridColor} />
                <XAxis
                    dataKey="date"
                    interval="preserveStart"
                    tickFormatter={(tickItem) => {
                        return moment(tickItem, 'DD MMM YYYY').format('D MMM');
                    }}
                    tick={{ fontSize: '11px', fill: labelColor }}
                    tickLine={{ stroke: labelColor, visibility: 'hidden' }}
                    axisLine={{ stroke: gridColor }}
                    dy={5}
                />
                <YAxis
                    interval="preserveStart"
                    width={45}
                    allowDecimals={false}
                    tickFormatter={(tickItem) => formatNumber(tickItem)}
                    tick={{ fontSize: '11px', fill: labelColor }}
                    tickLine={{ stroke: labelColor, visibility: 'hidden' }}
                    axisLine={{ stroke: gridColor }}
                    dx={-5}
                />
                <RechartsTooltip
                    position={{ y: 0 }}
                    contentStyle={{
                        paddingBottom: '16px',
                    }}
                    itemStyle={{
                        padding: 0,
                    }}
                    content={<RechartTooltip />}
                />
                <Line
                    dataKey="count"
                    stroke={lineColor}
                    strokeWidth={1.5}
                    type="monotone"
                    dot={false}
                    activeDot={{
                        fill: lineColor,
                        fillOpacity: 1,
                    }}
                ></Line>
                <Area
                    type="monotone"
                    dataKey="count"
                    strokeWidth={0}
                    fillOpacity={1}
                    fill={`url(#${gradientId})`}
                    activeDot={false}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default HomePage;
