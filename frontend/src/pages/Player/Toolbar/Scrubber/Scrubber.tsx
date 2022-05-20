import Button from '@components/Button/Button/Button';
import Tooltip from '@components/Tooltip/Tooltip';
import SvgDragIcon from '@icons/DragIcon';
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration';
import {
    ReplayerState,
    useReplayerContext,
} from '@pages/Player/ReplayerContext';
import { useToolbarItemsContext } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext';
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils';
import { MillisToMinutesAndSeconds } from '@util/time';
import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { NumberParam, useQueryParam } from 'use-query-params';

import styles from './Scrubber.module.scss';

interface Props {
    zanetodo: boolean;
}

const TICK_COUNT = 5;

const Scrubber = ({}: {}) => {
    const {
        zoomAreaLeft,
        setZoomAreaLeft,
        zoomAreaRight,
        setZoomAreaRight,
    } = useToolbarItemsContext();
    const {
        state,
        time,
        pause,
        play,
        setTime,
        sessionMetadata,
        sessionIntervals,
        setIsLoadingEvents,
    } = useReplayerContext();
    const { showPlayerAbsoluteTime } = usePlayerConfiguration();
    const draggableRef = useRef(null);
    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const sliderWrapperRef = useRef<HTMLDivElement>(null);
    const wrapperWidth =
        (sliderWrapperRef.current?.getBoundingClientRect().width ?? 1) - 12;
    const [dragTime, setDragTime] = useState(time);
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
    const [shouldPlay, setShouldPlay] = useState(false);
    const [zoomHistory, setZoomHistory] = useState<[number, number][]>([]);

    const getSliderPercent = useCallback(
        (time: number) => {
            let sliderPercent = 0;
            for (const interval of sessionIntervals) {
                if (time < interval.endTime && time >= interval.startTime) {
                    const segmentPercent =
                        (time - interval.startTime) /
                        (interval.endTime - interval.startTime);
                    sliderPercent =
                        segmentPercent *
                            (interval.endPercent - interval.startPercent) +
                        interval.startPercent;
                    return sliderPercent;
                }
            }
            return sliderPercent;
        },
        [sessionIntervals]
    );

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
        setDragTime(time);
    }, [time]);

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
    const curTime = showPlayerAbsoluteTime
        ? playerTimeToSessionAbsoluteTime({
              sessionStartTime: sessionMetadata.startTime,
              relativeTime: dragTime,
          }).toString()
        : MillisToMinutesAndSeconds(dragTime);

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
                    className={styles.tickWrapper}
                    onClick={(e) => {
                        const target = e.target as HTMLDivElement;
                        const rect = target.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const sliderPercent = x / wrapperWidth;
                        const newTime = getSliderTime(sliderPercent);
                        setTime(newTime);
                    }}
                >
                    {[...Array(TICK_COUNT).keys()].map((i) => {
                        const sliderPercent = i / (TICK_COUNT - 1);
                        const newTime = getSliderTime(sliderPercent);
                        return (
                            <span className={styles.tick} key={i}>
                                {MillisToMinutesAndSeconds(newTime)}
                            </span>
                        );
                    })}
                </div>
                <Draggable
                    nodeRef={draggableRef}
                    axis="x"
                    bounds={{ left: 0, right: wrapperWidth }}
                    onStop={(e, data) => {
                        const sliderPercent = data.x / wrapperWidth;
                        const newTime = getSliderTime(sliderPercent);
                        setTime(newTime);
                    }}
                    onDrag={(e, data) => {
                        const sliderPercent = data.x / wrapperWidth;
                        const newTime = getSliderTime(sliderPercent);
                        setIsLoadingEvents(true);
                        setDragTime(newTime);
                    }}
                    onStart={() => {
                        if (state === ReplayerState.Playing) {
                            setShouldPlay(true);
                            pause();
                        } else {
                            setShouldPlay(false);
                        }
                    }}
                    position={{
                        x: Math.max(getSliderPercent(time) * wrapperWidth, 0),
                        y: -36,
                    }}
                >
                    <div className={styles.handleContainer} ref={draggableRef}>
                        <div className={styles.scrubHandle}>
                            <div className={styles.timeText}>{curTime}</div>
                            <div className={styles.timeMarker}></div>
                        </div>
                    </div>
                </Draggable>
                <Draggable
                    nodeRef={leftRef}
                    axis="x"
                    bounds={{
                        left: 0,
                        right: dragRightPixels,
                    }}
                    position={{
                        x: dragLeftPixels,
                        y: 6,
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
                    <div
                        className={classNames(
                            styles.zoomAreaHandle,
                            styles.handleLeft
                        )}
                        ref={leftRef}
                    >
                        <SvgDragIcon
                            style={{
                                color: '#757575',
                                transform: 'translateY(-1px)',
                            }}
                        />
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
                        y: 6,
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
                    <div
                        className={classNames(
                            styles.zoomAreaHandle,
                            styles.handleRight
                        )}
                        ref={rightRef}
                    >
                        <SvgDragIcon
                            style={{
                                color: '#757575',
                                transform: 'translateY(-1px)',
                            }}
                        />
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
                <div className={styles.inactiveContainer}>
                    {sessionIntervals.map((i) => {
                        if (i.active) {
                            return null;
                        }

                        return (
                            <Tooltip key={i.startPercent} title={'Inactivity'}>
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
