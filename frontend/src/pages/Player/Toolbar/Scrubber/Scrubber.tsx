import Button from '@components/Button/Button/Button';
import Tooltip from '@components/Tooltip/Tooltip';
import SvgDragIcon from '@icons/DragIcon';
import { useReplayerContext } from '@pages/Player/ReplayerContext';
import { useToolbarItemsContext } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext';
import ActivityGraph from '@pages/Sessions/SessionsFeedV2/components/ActivityGraph/ActivityGraph';
import { MillisToMinutesAndSeconds } from '@util/time';
import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { NumberParam, useQueryParam } from 'use-query-params';

import styles from './Scrubber.module.scss';

interface Props {
    chartData: any[];
    sliderPercent: number;
}

const ActivityGraphMemoized = React.memo(ActivityGraph);

const Scrubber = ({ chartData, sliderPercent }: Props) => {
    const {
        zoomAreaLeft,
        setZoomAreaLeft,
        zoomAreaRight,
        setZoomAreaRight,
    } = useToolbarItemsContext();
    const { time, setTime, sessionIntervals } = useReplayerContext();
    const draggableRef = useRef(null);
    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const sliderWrapperRef = useRef<HTMLDivElement>(null);
    const wrapperWidth =
        sliderWrapperRef.current?.getBoundingClientRect().width ?? 1;
    const [dragTime, setDragTime] = useState(0);
    const [dragAreaLeft, setDragAreaLeft] = useState(zoomAreaLeft);
    const [dragAreaRight, setDragAreaRight] = useState(zoomAreaRight);
    const [zoomAreaLeftUrlParam, setZoomAreaLeftUrlParam] = useQueryParam(
        'zoomStart',
        NumberParam
    );
    const [zoomAreaRightUrlParam, setZoomAreaRightUrlParam] = useQueryParam(
        'zoomEnd',
        NumberParam
    );
    const [isDragging, setIsDragging] = useState(false);
    const [zoomHistory, setZoomHistory] = useState<[number, number][]>([]);
    const [eventCounts, setEventCounts] = useState<any[]>([]);

    useEffect(() => {
        if (chartData) {
            setEventCounts(chartData.map((d) => ({ value: d.count })));
        }
    }, [chartData]);

    const getSliderTime = useCallback(
        (sliderPercent: number) => {
            let newTime = 0;
            for (const interval of sessionIntervals) {
                if (
                    interval.endPercent === 1 ||
                    (sliderPercent < interval.endPercent &&
                        sliderPercent >= interval.startPercent)
                ) {
                    const segmentPercent =
                        (sliderPercent - interval.startPercent) /
                        (interval.endPercent - interval.startPercent);
                    newTime =
                        segmentPercent * interval.duration + interval.startTime;
                    return newTime;
                }
            }
            return newTime;
        },
        [sessionIntervals]
    );

    useEffect(() => {
        if (!isDragging) {
            setDragTime(time);
        }
    }, [time, isDragging]);

    useEffect(() => {
        setDragAreaLeft(zoomAreaLeft);
    }, [zoomAreaLeft]);

    useEffect(() => {
        setDragAreaRight(zoomAreaRight);
    }, [zoomAreaRight]);

    useEffect(() => {
        setZoomHistory((cur) => [...cur, [zoomAreaLeft, zoomAreaRight]]);
    }, [zoomAreaLeft, zoomAreaRight]);

    useEffect(() => {
        setZoomAreaLeftUrlParam(zoomAreaLeft, 'replaceIn');
        setZoomAreaRightUrlParam(zoomAreaRight, 'replaceIn');
    }, [
        setZoomAreaLeftUrlParam,
        setZoomAreaRightUrlParam,
        zoomAreaLeft,
        zoomAreaRight,
    ]);

    // Run this effect once on mount
    useEffect(() => {
        if (
            zoomAreaLeftUrlParam !== null &&
            zoomAreaLeftUrlParam !== undefined
        ) {
            setZoomAreaLeft(zoomAreaLeftUrlParam);
        }
        if (
            zoomAreaRightUrlParam !== null &&
            zoomAreaRightUrlParam !== undefined
        ) {
            setZoomAreaRight(zoomAreaRightUrlParam);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const zoomBack = useCallback(() => {
        if (zoomHistory.length <= 1) {
            return;
        }

        const withoutLast = zoomHistory.slice(0, -2);
        const newLast = zoomHistory[zoomHistory.length - 2];

        setZoomHistory(withoutLast);
        setZoomAreaLeft(newLast[0]);
        setZoomAreaRight(newLast[1]);
    }, [setZoomAreaLeft, setZoomAreaRight, zoomHistory]);

    const zoomReset = useCallback(() => {
        if (zoomHistory.length <= 1) {
            return;
        }

        setZoomHistory([]);
        setZoomAreaLeft(0);
        setZoomAreaRight(100);
    }, [setZoomAreaLeft, setZoomAreaRight, zoomHistory.length]);

    const isZoomed = zoomAreaLeft > 0 || zoomAreaRight < 100;
    const curTime = MillisToMinutesAndSeconds(dragTime);

    const dragLeftPixels = (dragAreaLeft / 100) * wrapperWidth;
    const dragRightPixels = (dragAreaRight / 100) * wrapperWidth;

    return (
        <div className={styles.scrubberBackground}>
            {isZoomed && (
                <div className={styles.zoomControlsWrapper}>
                    <Button
                        size="small"
                        onClick={zoomBack}
                        trackingId="PlayerZoomBack"
                        type="text"
                        style={{ padding: 0, marginLeft: 8 }}
                    >
                        Back
                    </Button>
                    <Button
                        size="small"
                        onClick={zoomReset}
                        trackingId="PlayerZoomReset"
                        type="text"
                        style={{ padding: 0, marginLeft: 8 }}
                    >
                        Reset
                    </Button>
                </div>
            )}
            <div className={styles.innerBounds} ref={sliderWrapperRef}>
                <div
                    className={styles.activityGraphWrapper}
                    style={{
                        left: `${zoomAreaLeft}%`,
                        width: `${zoomAreaRight - zoomAreaLeft}%`,
                    }}
                >
                    <ActivityGraphMemoized
                        data={eventCounts}
                        height={20}
                        disableAnimation
                    ></ActivityGraphMemoized>
                </div>
                <Draggable
                    nodeRef={draggableRef}
                    axis="x"
                    bounds={{ left: 0, right: wrapperWidth }}
                    onStop={(e, data) => {
                        const sliderPercent = data.x / wrapperWidth;
                        const newTime = getSliderTime(sliderPercent);
                        setTime(newTime);
                        setIsDragging(false);
                    }}
                    onDrag={(e, data) => {
                        const sliderPercent = data.x / wrapperWidth;
                        const newTime = getSliderTime(sliderPercent);
                        setDragTime(newTime);
                    }}
                    onStart={() => {
                        setIsDragging(true);
                    }}
                    position={{
                        x: Math.max(sliderPercent * wrapperWidth, 0),
                        y: -28,
                    }}
                >
                    <div
                        className={styles.scrubHandleContainer}
                        ref={draggableRef}
                    >
                        <div className={styles.scrubHandle}>
                            <div className={styles.timeText}>{curTime}</div>
                            <div className={styles.timeMarker}></div>
                        </div>
                    </div>
                </Draggable>
                <div className={styles.zoomer}>
                    <Draggable
                        nodeRef={leftRef}
                        axis="x"
                        bounds={{
                            left: 0,
                            right: dragRightPixels,
                        }}
                        position={{
                            x: dragLeftPixels,
                            y: 0,
                        }}
                        onStop={(e, data) => {
                            const sliderPercent = data.x / wrapperWidth;
                            setZoomAreaLeft(sliderPercent * 100);
                        }}
                        onDrag={(e, data) => {
                            const sliderPercent = data.x / wrapperWidth;
                            setDragAreaLeft(sliderPercent * 100);
                        }}
                    >
                        <div className={styles.handleContainer} ref={leftRef}>
                            <div
                                className={classNames(
                                    styles.zoomAreaHandle,
                                    styles.handleLeft
                                )}
                            >
                                <SvgDragIcon
                                    style={{
                                        color:
                                            'var(--color-scrubber-zoom-handle)',
                                    }}
                                />
                            </div>
                        </div>
                    </Draggable>
                    <Draggable
                        nodeRef={rightRef}
                        axis="x"
                        bounds={{
                            left: dragLeftPixels,
                            right: wrapperWidth,
                        }}
                        position={{
                            x: dragRightPixels,
                            y: 0,
                        }}
                        onStop={(e, data) => {
                            const sliderPercent = data.x / wrapperWidth;
                            setZoomAreaRight(sliderPercent * 100);
                        }}
                        onDrag={(e, data) => {
                            const sliderPercent = data.x / wrapperWidth;
                            setDragAreaRight(sliderPercent * 100);
                        }}
                    >
                        <div className={styles.handleContainer} ref={rightRef}>
                            <div
                                className={classNames(
                                    styles.zoomAreaHandle,
                                    styles.handleRight
                                )}
                            >
                                <SvgDragIcon
                                    style={{
                                        color:
                                            'var(--color-scrubber-zoom-handle)',
                                        transform: 'translateX(-2px)',
                                    }}
                                />
                            </div>
                        </div>
                    </Draggable>
                    <div
                        className={classNames(styles.zoomArea, {
                            [styles.zoomAreaCanReset]: false,
                        })}
                        style={{
                            left: `${dragAreaLeft}%`,
                            width: `${dragAreaRight - dragAreaLeft}%`,
                        }}
                    ></div>
                </div>
                <div className={styles.inactiveContainer}>
                    {sessionIntervals.map((i) => {
                        if (i.active) {
                            return null;
                        }

                        return (
                            <Tooltip
                                key={i.startPercent}
                                title={
                                    <div className={styles.inactivePopover}>
                                        <div>Inactive</div>
                                        <div
                                            className={
                                                styles.inactivePopoverDescription
                                            }
                                        >
                                            Inactivity represents time where the
                                            user isn't scrolling, clicking or
                                            interacting with your application.
                                        </div>
                                        <div
                                            className={
                                                styles.inactivePopoverTime
                                            }
                                        >
                                            {MillisToMinutesAndSeconds(
                                                i.startTime
                                            )}{' '}
                                            to{' '}
                                            {MillisToMinutesAndSeconds(
                                                i.endTime
                                            )}
                                        </div>
                                    </div>
                                }
                                mouseEnterDelay={0}
                            >
                                <div
                                    className={styles.inactiveArea}
                                    style={{
                                        left: `${i.startPercent * 100}%`,
                                        width: `${
                                            (i.endPercent - i.startPercent) *
                                            100
                                        }%`,
                                    }}
                                ></div>
                            </Tooltip>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Scrubber;
