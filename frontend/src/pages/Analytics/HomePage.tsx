import moment from 'moment';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    useGetDailySessionsCountQuery,
    useGetDailyErrorsCountQuery,
} from '../../graph/generated/hooks';
import {
    LineChart,
    XAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    CartesianGrid,
    YAxis,
    Line,
} from 'recharts';

import styles from './HomePage.module.scss';
import classNames from 'classnames';
import Skeleton from 'react-loading-skeleton';
import { dailyCountData } from '../../util/dashboardCalculations';
import { StandardDropdown } from '../../components/Dropdown/StandardDropdown/StandardDropdown';

type DailyCount = {
    date: string;
    count: number;
};

export const HomePage = () => {
    return (
        <div className={styles.dashboardWrapper}>
            <div className={styles.dashboard}>
                <div>
                    <div className={styles.title}>
                        Welcome back to Highlight.
                    </div>
                    <div className={styles.subTitle}>
                        Here’s an overview of your team’s sessions and errors.
                    </div>
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
];

const SessionCountGraph = () => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    // In days
    const [dateRangeLength, setDateRangeLength] = useState(7);
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
                <div className={styles.chartTitle}>Sessions per day</div>
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
    const [dateRangeLength, setDateRangeLength] = useState(7);
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
                <div className={styles.chartTitle}>Errors per day</div>
                <StandardDropdown
                    data={timeFilter}
                    onSelect={setDateRangeLength}
                />
            </div>
            <DailyChart data={errorCountData} lineColor={'#FFB038'} />
        </div>
    );
};

const DailyChart = ({
    data,
    lineColor = '#5629c6',
}: {
    data: Array<DailyCount>;
    lineColor?: string;
}) => {
    const gridColor = '#EAEAEA';
    const labelColor = '#111111';
    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 5,
                    right: 30,
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
                    width={30}
                    allowDecimals={false}
                    tick={{ fontSize: '11px', fill: labelColor }}
                    tickLine={{ stroke: labelColor }}
                    axisLine={{ stroke: gridColor }}
                    dx={-5}
                />
                <RechartsTooltip
                    contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        borderRadius: '5px',
                        borderWidth: 0,
                        color: 'white',
                    }}
                    itemStyle={{ color: 'white' }}
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
