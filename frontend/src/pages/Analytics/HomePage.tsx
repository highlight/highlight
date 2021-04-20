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

import styles from './HomePage.module.scss';
import classNames from 'classnames';
import Skeleton from 'react-loading-skeleton';
import { dailyCountData } from '../../util/dashboardCalculations';

type DailyCount = {
    date: string;
    count: number;
};

export const HomePage = () => {
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
    // In days
    const [dateRangeLength] = useState(30);
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
        <DailyChart data={sessionCountData} />
    );
};

const ErrorCountGraph = () => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    // In days
    const [dateRangeLength] = useState(30);
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
        <DailyChart data={errorCountData} />
    );
};

const DailyChart = ({ data }: { data: Array<DailyCount> }) => {
    return (
        <div className={classNames(styles.section, styles.graphSection)}>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    width={500}
                    height={300}
                    data={data}
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
                            moment(tickItem).format('D MMM')
                        }
                        tickLine={false}
                        interval={2}
                        axisLine={{ stroke: '#D9D9D9' }}
                    />
                    <YAxis
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
                        dataKey="count"
                        radius={[2, 2, 0, 0]}
                        fill={'#eee7ff'}
                    ></Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
