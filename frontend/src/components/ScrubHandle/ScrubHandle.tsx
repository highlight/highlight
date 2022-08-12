import { useReplayerContext } from '@pages/Player/ReplayerContext';
import { useToolbarItemsContext } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext';
import { MillisToMinutesAndSeconds } from '@util/time';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';

import styles from './ScrubHandle.module.scss';

interface Props {
    wrapperWidth: number;
}

const ScrubHandle = React.memo(({ wrapperWidth }: Props) => {
    const draggableRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragTime, setDragTime] = useState(0);

    const { time, setTime, sessionIntervals } = useReplayerContext();
    const { zoomAreaLeft, zoomAreaRight } = useToolbarItemsContext();

    useEffect(() => {
        if (!isDragging) {
            setDragTime(time);
        }
    }, [time, isDragging]);

    const getSliderFrac = useCallback(
        (time: number) => {
            let sliderFrac = 0;
            for (const interval of sessionIntervals) {
                if (time < interval.endTime && time >= interval.startTime) {
                    const segmentFrac =
                        (time - interval.startTime) /
                        (interval.endTime - interval.startTime);
                    sliderFrac =
                        segmentFrac *
                            (interval.endPercent - interval.startPercent) +
                        interval.startPercent;
                    break;
                }
            }
            return sliderFrac;
        },
        [sessionIntervals]
    );

    const getCurrentTime = useCallback(
        (sliderFrac: number) => {
            const progressFrac =
                (sliderFrac * (zoomAreaRight - zoomAreaLeft) + zoomAreaLeft) /
                100;

            let currentTime = 0;

            for (const interval of sessionIntervals) {
                if (
                    progressFrac < interval.endPercent &&
                    progressFrac >= interval.startPercent
                ) {
                    const segmentFrac =
                        (progressFrac - interval.startPercent) /
                        (interval.endPercent - interval.startPercent);
                    currentTime =
                        segmentFrac * (interval.endTime - interval.startTime) +
                        interval.startTime;
                    break;
                }
            }

            return currentTime;
        },
        [sessionIntervals, zoomAreaLeft, zoomAreaRight]
    );

    return (
        <Draggable
            nodeRef={draggableRef}
            axis="x"
            bounds={{ left: 0, right: wrapperWidth }}
            onStop={(e, data) => {
                const sliderPercent = data.x / wrapperWidth;
                const newTime = getCurrentTime(sliderPercent);
                setTime(newTime);
                setIsDragging(false);
            }}
            onDrag={(e, data) => {
                const sliderPercent = data.x / wrapperWidth;
                const newTime = getCurrentTime(sliderPercent);
                setDragTime(newTime);
            }}
            onStart={() => {
                setIsDragging(true);
            }}
            position={{
                x: Math.min(
                    getSliderFrac(dragTime) * wrapperWidth,
                    wrapperWidth
                ),
                y: 0,
            }}
        >
            <div className={styles.scrubHandleContainer} ref={draggableRef}>
                <div className={styles.scrubHandle}>
                    <div className={styles.timeText}>
                        {MillisToMinutesAndSeconds(dragTime)}
                    </div>
                    <div className={styles.timeMarker}></div>
                </div>
            </div>
        </Draggable>
    );
});

export default ScrubHandle;
