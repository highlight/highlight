import { useReplayerContext } from '@pages/Player/ReplayerContext';
import { useToolbarItemsContext } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext';
import { MillisToMinutesAndSeconds } from '@util/time';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';

import styles from './ScrubHandle.module.scss';

interface Props {
    wrapperWidth: number;
    bucketTimes: number[];
}

const ScrubHandle = React.memo(({ wrapperWidth, bucketTimes }: Props) => {
    const draggableRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [dragTime, setDragTime] = useState(0);

    const { time, setTime } = useReplayerContext();
    const { zoomAreaLeft, zoomAreaRight } = useToolbarItemsContext();

    useEffect(() => {
        if (!isDragging) {
            setDragTime(time);
        }
    }, [time, isDragging]);

    useEffect(() => {
        if (
            bucketTimes.length &&
            bucketTimes[0] <= dragTime &&
            dragTime <= bucketTimes[bucketTimes.length - 1]
        ) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [bucketTimes, dragTime]);

    const getSliderFrac = useCallback(
        (time: number) => {
            const bucketStartTimes = bucketTimes.slice(0, -1);
            const bucketEndTimes = bucketTimes.slice(1);

            let sliderFrac = 0;

            for (let idx = 0; idx < bucketEndTimes.length; ++idx) {
                const endTime = bucketEndTimes[idx];
                const startTime = bucketStartTimes[idx];
                if (time < endTime && time >= startTime) {
                    const spaceFracPerBar = 1 / bucketStartTimes.length;
                    const partialBarProgress =
                        (time - startTime) / (endTime - startTime);
                    sliderFrac = spaceFracPerBar * (idx + partialBarProgress);
                    break;
                }
            }
            if (time === bucketEndTimes.pop()) {
                sliderFrac = 1;
            }
            return sliderFrac;
        },
        [bucketTimes]
    );

    const getCurrentTime = useCallback(
        (sliderFrac: number) => {
            const bucketStartTimes = bucketTimes.slice(0, -1);
            const bucketEndTimes = bucketTimes.slice(1);

            const spaceFracPerBar = 1 / bucketStartTimes.length;
            const idx = Math.floor(sliderFrac / spaceFracPerBar);

            if (idx == bucketEndTimes.length) {
                return bucketEndTimes.pop() || 0;
            }
            const partialBarProgress = sliderFrac / spaceFracPerBar - idx;

            const currentTime =
                bucketStartTimes[idx] +
                (bucketEndTimes[idx] - bucketStartTimes[idx]) *
                    partialBarProgress;
            return currentTime;
        },
        [bucketTimes]
    );

    return (
        <Draggable
            nodeRef={draggableRef}
            axis="x"
            bounds={{ left: 0, right: wrapperWidth }}
            onStop={(e, data) => {
                const sliderProgress = data.x / wrapperWidth;
                const newTime = getCurrentTime(sliderProgress);
                setTime(newTime);
                setIsDragging(false);
            }}
            onDrag={(e, data) => {
                const sliderProgress = data.x / wrapperWidth;
                const newTime = getCurrentTime(sliderProgress);
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
            <div
                className={styles.scrubHandleContainer}
                ref={draggableRef}
                style={{ visibility: isVisible ? 'visible' : 'hidden' }}
            >
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
