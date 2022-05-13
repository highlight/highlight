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

import styles from './Scrubber.module.scss';

interface Props {
    zanetodo: boolean;
}

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
    } = useReplayerContext();
    const { showPlayerAbsoluteTime } = usePlayerConfiguration();
    const draggableRef = useRef(null);
    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const sliderWrapperRef = useRef<HTMLDivElement>(null);
    const wrapperWidth =
        sliderWrapperRef.current?.getBoundingClientRect().width ?? 1;
    const [dragTime, setDragTime] = useState(time);
    const [dragAreaLeft, setDragAreaLeft] = useState(zoomAreaLeft);
    const [dragAreaRight, setDragAreaRight] = useState(zoomAreaRight);
    const [shouldPlay, setShouldPlay] = useState(false);

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
                    sliderPercent < interval.endPercent &&
                    sliderPercent >= interval.startPercent
                ) {
                    if (!interval.active) {
                        return interval.endTime;
                    }
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
        setDragAreaRight(dragAreaRight);
    }, [dragAreaRight]);

    const isZoomed = zoomAreaLeft > 0 || zoomAreaRight < 100;
    const curTime = showPlayerAbsoluteTime
        ? playerTimeToSessionAbsoluteTime({
              sessionStartTime: sessionMetadata.startTime,
              relativeTime: dragTime,
          }).toString()
        : MillisToMinutesAndSeconds(dragTime);

    return (
        <div className={styles.scrubberBackground}>
            <div
                className={styles.clickChangeTime}
                onClick={(e) => {
                    const target = e.target as HTMLDivElement;
                    const rect = target.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const sliderPercent = x / wrapperWidth;
                    const newTime = getSliderTime(sliderPercent);
                    setTime(newTime);
                }}
            ></div>
            <div className={styles.innerBounds} ref={sliderWrapperRef}>
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
                        y: -40,
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
                    position={{
                        x: (dragAreaLeft / 100) * wrapperWidth,
                        y: 10,
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
                    ></div>
                </Draggable>
                <Draggable
                    nodeRef={rightRef}
                    axis="x"
                    position={{
                        x: (dragAreaRight / 100) * wrapperWidth,
                        y: 10,
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
                    ></div>
                </Draggable>
                <div
                    className={classNames(styles.zoomArea, {
                        [styles.zoomAreaCanReset]: isZoomed,
                    })}
                    style={{
                        left: `${dragAreaLeft}%`,
                        width: `${dragAreaRight - dragAreaLeft}%`,
                    }}
                    onClick={() => {
                        setZoomAreaLeft(0);
                        setZoomAreaRight(100);
                    }}
                ></div>
            </div>
        </div>
    );
};

export default Scrubber;
