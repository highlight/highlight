import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration';
import { useReplayerContext } from '@pages/Player/ReplayerContext';
import { useToolbarItemsContext } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext';
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils';
import { MillisToMinutesAndSeconds } from '@util/time';
import classNames from 'classnames';
import React, { useCallback, useRef } from 'react';
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
    const { time, sessionMetadata, sessionIntervals } = useReplayerContext();
    const { showPlayerAbsoluteTime } = usePlayerConfiguration();
    const draggableRef = useRef(null);
    const sliderWrapperRef = useRef<HTMLDivElement>(null);
    const wrapperWidth =
        sliderWrapperRef.current?.getBoundingClientRect().width ?? 1;

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

    const isZoomed = zoomAreaLeft > 0 || zoomAreaRight < 100;
    const curTime = showPlayerAbsoluteTime
        ? playerTimeToSessionAbsoluteTime({
              sessionStartTime: sessionMetadata.startTime,
              relativeTime: time,
          }).toString()
        : MillisToMinutesAndSeconds(time);

    return (
        <div className={styles.scrubberBackground} ref={sliderWrapperRef}>
            <Draggable
                nodeRef={draggableRef}
                axis="x"
                bounds="parent"
                onStop={() => {
                    console.log('draggable onStop');
                }}
                onDrag={() => {
                    console.log('draggable onDrag');
                }}
                onStart={() => {
                    console.log('draggable onStart');
                }}
                // disabled={disableControls}
                position={{
                    x: Math.max(getSliderPercent(time) * wrapperWidth - 10, 0),
                    y: 0,
                }}
            >
                <div className={styles.scrubHandle}>
                    <div className={styles.timeText}>{curTime}</div>
                    <div className={styles.timeMarker}></div>
                </div>
            </Draggable>
            <button
                className={classNames(styles.zoomArea, {
                    [styles.zoomAreaCanReset]: isZoomed,
                })}
                style={{
                    left: `${zoomAreaLeft}%`,
                    width: `${zoomAreaRight - zoomAreaLeft}%`,
                }}
                onClick={() => {
                    setZoomAreaLeft(0);
                    setZoomAreaRight(100);
                }}
            ></button>
        </div>
    );
};

export default Scrubber;
