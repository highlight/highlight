import classNames from 'classnames';
import moment from 'moment';
import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';
import {
    CartesianGrid,
    Line,
    LineChart,
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
import styles from './HomePage.module.scss';

type DailyCount = {
    date: string;
    count: number;
};

const HomePage = () => {
    return (
        <div className={styles.dashboardWrapper}>
            <div className={styles.dashboard}>
                <div>
                    <h2>Welcome back to Highlight.</h2>
                    <p className={styles.subTitle}>
                        Here’s an overview of your team’s sessions and errors.
                    </p>
                </div>
                <div className={styles.dashboardBody}>
                    <SessionCountGraph />
                    <ErrorCountGraph />
                </div>
            </div>
        </div>
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
    // In days
    const [dateRangeLength, setDateRangeLength] = useState(timeFilter[0].value);
    const [sessionCountData, setSessionCountData] = useState<Array<DailyCount>>(
        []
    );

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
                <StandardDropdown
                    data={timeFilter}
                    onSelect={setDateRangeLength}
                />
            </div>
            <DailyChart data={sessionCountData} />
        </div>
    );
};

const ErrorCountGraph = () => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    // In days
    const [dateRangeLength, setDateRangeLength] = useState(timeFilter[0].value);
    const [errorCountData, setErrorCountData] = useState<Array<DailyCount>>([]);

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
                <StandardDropdown
                    data={timeFilter}
                    onSelect={setDateRangeLength}
                />
            </div>
            <DailyChart
                data={errorCountData}
                lineColor={'var(--color-orange-400)'}
            />
        </div>
    );
};

const DailyChart = ({
    data,
    lineColor = 'var(--color-purple)',
}: {
    data: Array<DailyCount>;
    lineColor?: string;
}) => {
    const gridColor = 'var(--color-gray-300)';
    const labelColor = 'var(--color-gray-500)';
    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 5,
                    right: 35,
                    left: 0,
                    bottom: 0,
                }}
            >
                <CartesianGrid stroke={gridColor} />
                <XAxis
                    dataKey="date"
                    interval="preserveStart"
                    tickFormatter={(tickItem) =>
                        moment(tickItem).format('D MMM')
                    }
                    tick={{ fontSize: '11px', fill: labelColor }}
                    tickLine={{ stroke: labelColor }}
                    axisLine={{ stroke: gridColor }}
                    dy={5}
                />
                <YAxis
                    interval="preserveStart"
                    width={45}
                    allowDecimals={false}
                    tickFormatter={(tickItem) => formatNumber(tickItem)}
                    tick={{ fontSize: '11px', fill: labelColor }}
                    tickLine={{ stroke: labelColor }}
                    axisLine={{ stroke: gridColor }}
                    dx={-5}
                />
                <RechartsTooltip
                    contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        borderRadius: 'var(--border-radius)',
                        borderWidth: 0,
                        color: 'var(--text-primary-inverted)',
                        paddingBottom: '16px',
                    }}
                    itemStyle={{
                        color: 'var(--text-primary-inverted)',
                        padding: 0,
                    }}
                    labelStyle={{
                        color: 'var(--text-primary-inverted)',
                    }}
                />
                <Line
                    dataKey="count"
                    stroke={lineColor}
                    strokeWidth={1.5}
                ></Line>
            </LineChart>
        </ResponsiveContainer>
    );
};

export default HomePage;
