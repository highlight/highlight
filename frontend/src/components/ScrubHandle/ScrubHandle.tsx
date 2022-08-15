import { useReplayerContext } from '@pages/Player/ReplayerContext';
import { MillisToMinutesAndSeconds } from '@util/time';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';

import styles from './ScrubHandle.module.scss';

interface Props {
    wrapperWidth: number;
    leftTime: number;
    rightTime: number;
}

const ScrubHandle = React.memo(
    ({ wrapperWidth, leftTime, rightTime }: Props) => {
        const draggableRef = useRef(null);
        const [isVisible, setIsVisible] = useState(true);
        const [isDragging, setIsDragging] = useState(false);
        const [dragTime, setDragTime] = useState(0);

        const { time, setTime } = useReplayerContext();

        useEffect(() => {
            if (!isDragging) {
                setDragTime(time);
            }
        }, [time, isDragging]);

        useEffect(() => {
            setIsVisible(leftTime <= dragTime && dragTime <= rightTime);
        }, [leftTime, rightTime, dragTime]);

        const getSliderFrac = useCallback(
            (time: number) => {
                return Math.max(
                    Math.min((time - leftTime) / (rightTime - leftTime), 1),
                    0
                );
            },
            [leftTime, rightTime]
        );

        const getCurrentTime = useCallback(
            (sliderFrac: number) => {
                return leftTime + sliderFrac * (rightTime - leftTime);
            },
            [leftTime, rightTime]
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
    }
);

export default ScrubHandle;
