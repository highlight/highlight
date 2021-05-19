import classNames from 'classnames';
import moment from 'moment';
import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useHistory, useParams } from 'react-router-dom';
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

import { StandardDropdown } from '../../components/Dropdown/StandardDropdown/StandardDropdown';
import {
    useGetDailyErrorsCountQuery,
    useGetDailySessionsCountQuery,
} from '../../graph/generated/hooks';
import { dailyCountData } from '../../util/dashboardCalculations';
import { formatNumber } from '../../util/numbers';
import { SessionPageSearchParams } from '../Player/utils/utils';
import {
    HomePageFiltersContext,
    useHomePageFiltersContext,
} from './components/HomePageFilters/HomePageFiltersContext';
import ReferrersTable from './components/ReferrersTable/ReferrersTable';
import styles from './HomePage.module.scss';

type DailyCount = {
    date: string;
    count: number;
    label: string;
};

const HomePage = () => {
    const [dateRangeLength, setDateRangeLength] = useState<number>(
        timeFilter[0].value
    );

    return (
        <HomePageFiltersContext value={{ dateRangeLength, setDateRangeLength }}>
            <div className={styles.dashboardWrapper}>
                <div className={styles.dashboard}>
                    <div className={styles.headerContainer}>
                        <div>
                            <h2>Welcome back to Highlight.</h2>
                            <p className={styles.subTitle}>
                                Here’s an overview of your team’s sessions and
                                errors.
                            </p>
                        </div>
                        <div className={styles.filtersContainer}>
                            <StandardDropdown
                                data={timeFilter}
                                onSelect={setDateRangeLength}
                            />
                        </div>
                    </div>
                    <div className={styles.dashboardBody}>
                        <SessionCountGraph />
                        <ErrorCountGraph />
                        <ReferrersTable />
                    </div>
                </div>
            </div>
        </HomePageFiltersContext>
    );
};

const timeFilter = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
] as const;

const SessionCountGraph = () => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const { dateRangeLength } = useHomePageFiltersContext();
    const [sessionCountData, setSessionCountData] = useState<Array<DailyCount>>(
        []
    );
    const history = useHistory();

    const { loading } = useGetDailySessionsCountQuery({
        variables: {
            organization_id,
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

    return loading ? (
        <Skeleton count={1} style={{ width: '100%', height: 300 }} />
    ) : (
        <div className={classNames(styles.section, styles.graphSection)}>
            <div className={styles.chartHeaderWrapper}>
                <h3>Sessions per day</h3>
            </div>
            <DailyChart
                data={sessionCountData}
                name="Sessions"
                onClickHandler={(payload: any) => {
                    history.push(
                        `/${organization_id}/sessions?${SessionPageSearchParams.date}=${payload.activeLabel}`
                    );
                }}
            />
        </div>
    );
};

const ErrorCountGraph = () => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const { dateRangeLength } = useHomePageFiltersContext();
    const [errorCountData, setErrorCountData] = useState<Array<DailyCount>>([]);
    const history = useHistory();

    const { loading } = useGetDailyErrorsCountQuery({
        variables: {
            organization_id,
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
        <Skeleton count={1} style={{ width: '100%', height: 300 }} />
    ) : (
        <div className={classNames(styles.section, styles.graphSection)}>
            <div className={styles.chartHeaderWrapper}>
                <h3>Errors per day</h3>
            </div>
            <DailyChart
                data={errorCountData}
                lineColor={'var(--color-orange-400)'}
                name="Errors"
                onClickHandler={(payload: any) => {
                    history.push(
                        `/${organization_id}/errors?${SessionPageSearchParams.date}=${payload.activeLabel}`
                    );
                }}
            />
        </div>
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
        <ResponsiveContainer width="100%" height={250}>
            <ComposedChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 0,
                    right: 12,
                    left: 0,
                    bottom: 0,
                }}
                onClick={(payload: any) => {
                    if (onClickHandler) {
                        onClickHandler(payload);
                    }
                }}
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
                    tickFormatter={(tickItem) =>
                        moment(tickItem).format('D MMM')
                    }
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
                    contentStyle={{
                        paddingBottom: '16px',
                    }}
                    itemStyle={{
                        padding: 0,
                    }}
                    content={<CustomTooltip />}
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

export const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.tooltip}>
                <h4>{label}</h4>
                <p>
                    {payload[0].value} {payload[0].payload.label}
                </p>
            </div>
        );
    }

    return null;
};
