import { Skeleton } from '@components/Skeleton/Skeleton';
import StackedAreaChart from '@components/StackedAreaChart/StackedAreaChart';
import SvgCarDashboardIcon from '@icons/CarDashboardIcon';
import SvgTimerIcon from '@icons/TimerIcon';
import { useReplayerContext } from '@pages/Player/ReplayerContext';
import { MillisToMinutesAndSeconds } from '@util/time';
import React from 'react';

import styles from './PerformancePage.module.scss';

type Props = {
    currentTime: number;
    startTime: number;
};

const PerformancePage = React.memo(({ currentTime, startTime }: Props) => {
    const {
        performancePayloads,
        pause,
        events,
        session,
    } = useReplayerContext();

    const graphData = performancePayloads.map((payload) => {
        return {
            timestamp: payload.relativeTimestamp * 1000,
            fps: payload.fps,
            memoryUsagePercent:
                payload.usedJSHeapSize / payload.jsHeapSizeLimit,
        };
    });

    const isLoading = events.length === 0 && performancePayloads.length === 0;
    const hasNoPerformancePayloads =
        events.length > 0 && performancePayloads.length === 0;

    return (
        <div className={styles.container}>
            {isLoading && (
                <div className={styles.emptyContainer}>
                    <Skeleton height="100%" />
                </div>
            )}
            {hasNoPerformancePayloads && (
                <div className={styles.emptyContainer}>
                    <div className={styles.messageContainer}>
                        <p>This session has no performance data.</p>
                    </div>
                </div>
            )}
            {!isLoading &&
                [
                    {
                        key: 'fps',
                        strokeColor: 'var(--color-green-700)',
                        fillColor: 'var(--color-green-400)',
                        yAxisLabel: 'Frames per Second',
                        tooltipIcon: <SvgTimerIcon />,
                        chartLabel: 'Frames Per Second',
                    },
                    {
                        key: 'memoryUsagePercent',
                        strokeColor: 'var(--color-blue-700)',
                        fillColor: 'var(--color-blue-400)',
                        yAxisTickFormatter: (tickItem: number) =>
                            `${(tickItem * 100).toFixed(0)}%`,
                        yAxisLabel: 'Memory Used',
                        tooltipIcon: <SvgCarDashboardIcon />,
                        chartLabel: 'Device Memory',
                    },
                ].map(
                    ({
                        key,
                        strokeColor,
                        fillColor,
                        yAxisTickFormatter,
                        yAxisLabel,
                        tooltipIcon,
                        chartLabel,
                    }) => {
                        const timestamps = graphData.map((d) => d.timestamp);
                        const closestTimestamp = findClosestTimestamp(
                            timestamps,
                            currentTime - startTime
                        );
                        const data = graphData.map((d) => ({
                            timestamp: d.timestamp,
                            // @ts-expect-error
                            [key]: d[key],
                        }));

                        if (data.length === 0) {
                            return (
                                <div className={styles.noDataContainer}>
                                    <p>
                                        {session?.browser_name}{' '}
                                        {session?.browser_version} does not
                                        support recording {chartLabel}.
                                    </p>
                                </div>
                            );
                        }

                        return (
                            <StackedAreaChart
                                key={key}
                                data={data}
                                xAxisKey="timestamp"
                                showXAxis={key !== 'fps'}
                                heightPercent="50%"
                                fillColor={fillColor}
                                strokeColor={strokeColor}
                                syncId="PerformancePageDevTools"
                                xAxisTickFormatter={(tickItem) => {
                                    return MillisToMinutesAndSeconds(tickItem);
                                }}
                                onClickHandler={(event) => {
                                    if (event?.activePayload?.length > 0) {
                                        const timestamp =
                                            event.activePayload[0].payload
                                                .timestamp;

                                        pause(timestamp);
                                    }
                                }}
                                yAxisTickFormatter={yAxisTickFormatter}
                                referenceLineProps={{
                                    stroke: 'var(--color-purple)',
                                    x: closestTimestamp,
                                }}
                                yAxisLabel={yAxisLabel}
                                tooltipIcon={tooltipIcon}
                                chartLabel={chartLabel}
                            />
                        );
                    }
                )}
        </div>
    );
});

export default PerformancePage;

function findClosestTimestamp(nums: Array<number>, key: number): number {
    let low = 0;
    let high = nums.length - 1;
    let mid = 0;
    while (low <= high) {
        mid = Math.floor((low + high) / 2);
        if (nums[mid] === key) {
            return nums[mid + 1];
        }
        if (key > nums[mid]) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return nums[mid - 1];
}
