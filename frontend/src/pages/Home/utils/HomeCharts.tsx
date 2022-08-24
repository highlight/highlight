import BarChartV2 from '@components/BarChartV2/BarCharV2';
import Card from '@components/Card/Card';
import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import {
    useGetDailyErrorsCountQuery,
    useGetDailySessionsCountQuery,
} from '@graph/hooks';
import { useHomePageFiltersContext } from '@pages/Home/components/HomePageFilters/HomePageFiltersContext';
import { SessionPageSearchParams } from '@pages/Player/utils/utils';
import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams';
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext';
import { dailyCountData } from '@util/dashboardCalculations';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import moment from 'moment/moment';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useHistory } from 'react-router-dom';
import { ResponsiveContainer } from 'recharts';

type DailyCount = {
    date: string;
    count: number;
    label: string;
};

export const HomePageTimeFilter = [
    { label: 'Last 24 hours', value: 2 },
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
    { label: 'This year', value: 30 * 12 },
] as const;

export const SessionCountGraph = ({
    setUpdatingData,
}: {
    setUpdatingData: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
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

    useEffect(() => {
        setUpdatingData(loading);
    }, [setUpdatingData, loading]);

    return loading ? (
        <Skeleton count={1} style={{ width: '100%', height: 334 }} />
    ) : (
        <Card full>
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

export const ErrorCountGraph = ({
    setUpdatingData,
}: {
    setUpdatingData: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
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

    useEffect(() => {
        setUpdatingData(loading);
    }, [setUpdatingData, loading]);

    return loading ? (
        <Skeleton count={1} style={{ width: '100%', height: 334 }} />
    ) : (
        <Card full>
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
    return (
        <ResponsiveContainer width="100%" height={275}>
            <BarChartV2
                height={275}
                data={data}
                barColorMapping={{
                    count: lineColor,
                }}
                xAxisDataKeyName="range_end"
                xAxisLabel={name}
                xAxisTickFormatter={(value: number) =>
                    value < 1 ? value.toFixed(2) : value.toFixed(0)
                }
                yAxisLabel={'occurrences'}
                yAxisKeys={['count']}
                onClickHandler={onClickHandler}
            />
        </ResponsiveContainer>
    );
};
