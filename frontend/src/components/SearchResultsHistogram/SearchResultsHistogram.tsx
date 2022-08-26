import Histogram, { Series } from '@components/Histogram/Histogram';
import moment from 'moment';
import React, { useCallback } from 'react';

import styles from './SearchResultsHistogram.module.css';

export const SearchResultsHistogram = React.memo(
    ({
        seriesList,
        bucketTimes,
        bucketSize,
        loading,
        updateTimeRange,
    }: {
        seriesList: Series[];
        bucketTimes: number[];
        bucketSize: string;
        loading: boolean;
        updateTimeRange: (startTime: Date, endTime: Date) => void;
    }) => {
        const onAreaChanged = useCallback(
            (left: number, right: number) => {
                // bucketTimes should always be one longer than the number of buckets
                if (bucketTimes.length <= right + 1) return;
                const newStartTime = new Date(bucketTimes[left]);
                const newEndTime = new Date(bucketTimes[right + 1]);
                updateTimeRange(newStartTime, newEndTime);
            },
            [bucketTimes, updateTimeRange]
        );
        const onBucketClicked = useCallback(
            (bucketIndex: number) => onAreaChanged(bucketIndex, bucketIndex),
            [onAreaChanged]
        );
        const timeFormatter = useCallback(
            (t: number) => {
                if (
                    bucketTimes.length > 0 &&
                    t === bucketTimes[bucketTimes.length - 1]
                ) {
                    return moment(t).format('MMM D h:mm a');
                }
                switch (bucketSize) {
                    case 'minute':
                    case 'hour':
                        return moment(t).format('MMM D h:mm a');
                    case 'day':
                    case 'week':
                        return moment(t).format('MMMM D');
                    case 'month':
                    case 'quarter':
                        return moment(t).format('MMMM');
                    default:
                        return moment(t).format('MMMM D h:mm a');
                }
            },
            [bucketTimes, bucketSize]
        );
        const tooltipContent = useCallback(
            (bucketIndex: number) => {
                const seriesTooltips = seriesList
                    .filter((series: Series) => series.counts[bucketIndex] > 0)
                    .map((series: Series, index: number) => (
                        <div
                            key={index}
                            className={styles.histogramSeriesTooltip}
                        >
                            <span
                                className={styles.histogramSeriesIcon}
                                style={{
                                    background: `var(${series.color})`,
                                }}
                            ></span>
                            {series.label} x {series.counts[bucketIndex]}
                        </div>
                    ));
                return (
                    <div className={styles.histogramTooltip}>
                        {seriesTooltips.length > 0
                            ? seriesTooltips
                            : 'No results'}
                    </div>
                );
            },
            [seriesList]
        );
        return (
            <Histogram
                onAreaChanged={onAreaChanged}
                onBucketClicked={onBucketClicked}
                seriesList={seriesList}
                timeFormatter={timeFormatter}
                bucketTimes={bucketTimes}
                tooltipContent={tooltipContent}
                tooltipDelayMs={500}
                loading={loading}
            />
        );
    }
);
