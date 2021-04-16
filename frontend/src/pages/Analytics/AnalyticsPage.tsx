import moment from 'moment';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    useGetDailySessionsCountQuery,
    useGetDailyErrorsCountQuery,
} from '../../graph/generated/hooks';
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    CartesianGrid,
    YAxis,
} from 'recharts';

import styles from './AnalyticsPage.module.scss';
import classNames from 'classnames';
import Skeleton from 'react-loading-skeleton';

type SessionCount = {
    date: string;
    sessions: number;
};

type ErrorCount = {
    date: string;
    errors: number;
};

export const AnalyticsPage = () => {
    return (
        <div className={styles.dashboardWrapper}>
            <div className={styles.dashboard}>
                <div>
                    <h2 className={styles.title}>Dashboard</h2>
                </div>
                <div className={styles.subTitle}>Sessions</div>
                <SessionCountGraph />
                <div className={styles.subTitle}>Errors</div>
                <ErrorCountGraph />
            </div>
        </div>
    );
};

const SessionCountGraph = () => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const [dateRangeLength] = useState(30);
    const [sessionCountData, setSessionCountData] = useState<
        Array<SessionCount>
    >([]);

    const { loading } = useGetDailySessionsCountQuery({
        variables: {
            organization_id,
            duration: {
                start_date: moment()
                    .subtract(dateRangeLength, 'd')
                    .startOf('day'),
                end_date: moment().startOf('day'),
            },
        },
        onCompleted: (response) => {
            if (response.dailySessionsCount) {
                const today = moment();
                const dateRangeData = Array(dateRangeLength).fill(0);
                for (const item of response.dailySessionsCount ?? []) {
                    const itemDate = moment(item?.date);
                    const insertIndex =
                        dateRangeData.length - 1 - today.diff(itemDate, 'days');
                    if (
                        insertIndex >= 0 ||
                        insertIndex < dateRangeData.length
                    ) {
                        dateRangeData[insertIndex] = item?.session_count;
                    }
                }
                const sessionCounts = dateRangeData.map((val, idx) => ({
                    date: moment()
                        .startOf('day')
                        .subtract(dateRangeLength - 1 - idx, 'days')
                        .format('D MMM YYYY'),
                    sessions: val,
                }));
                setSessionCountData(sessionCounts);
            }
        },
    });

    return loading ? (
        <Skeleton count={1} style={{ width: '100%', height: 300 }} />
    ) : (
        <div className={classNames(styles.section, styles.graphSection)}>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    width={500}
                    height={300}
                    data={sessionCountData}
                    margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid stroke={'#D9D9D9'} vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(tickItem) =>
                            moment(tickItem).format('ddd M/D')
                        }
                        tickLine={false}
                        axisLine={{ stroke: '#D9D9D9' }}
                    />
                    <YAxis
                        tickCount={10}
                        interval="preserveStart"
                        allowDecimals={false}
                        hide={true}
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
                    <Bar
                        dataKey="sessions"
                        radius={[2, 2, 0, 0]}
                        fill={'#eee7ff'}
                    ></Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const ErrorCountGraph = () => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const [dateRangeLength] = useState(30);
    const [errorCountData, setErrorCountData] = useState<Array<ErrorCount>>([]);

    const { loading } = useGetDailyErrorsCountQuery({
        variables: {
            organization_id,
            duration: {
                start_date: moment()
                    .subtract(dateRangeLength, 'd')
                    .startOf('day'),
                end_date: moment().startOf('day'),
            },
        },
        onCompleted: (response) => {
            if (response.dailyErrorsCount) {
                const today = moment();
                const dateRangeData = Array(dateRangeLength).fill(0);
                for (const item of response.dailyErrorsCount ?? []) {
                    const itemDate = moment(item?.date);
                    const insertIndex =
                        dateRangeData.length - 1 - today.diff(itemDate, 'days');
                    if (
                        insertIndex >= 0 ||
                        insertIndex < dateRangeData.length
                    ) {
                        dateRangeData[insertIndex] = item?.error_count;
                    }
                }
                const errorCounts = dateRangeData.map((val, idx) => ({
                    date: moment()
                        .startOf('day')
                        .subtract(dateRangeLength - 1 - idx, 'days')
                        .format('D MMM YYYY'),
                    errors: val,
                }));
                setErrorCountData(errorCounts);
            }
        },
    });

    return loading ? (
        <Skeleton count={1} style={{ width: '100%', height: 300 }} />
    ) : (
        <div className={classNames(styles.section, styles.graphSection)}>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    width={500}
                    height={300}
                    data={errorCountData}
                    margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid stroke={'#D9D9D9'} vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(tickItem) =>
                            moment(tickItem).format('ddd M/D')
                        }
                        tickLine={false}
                        axisLine={{ stroke: '#D9D9D9' }}
                    />
                    <YAxis
                        tickCount={10}
                        interval="preserveStart"
                        allowDecimals={false}
                        hide={true}
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
                    <Bar
                        dataKey="errors"
                        radius={[2, 2, 0, 0]}
                        fill={'#eee7ff'}
                    ></Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
