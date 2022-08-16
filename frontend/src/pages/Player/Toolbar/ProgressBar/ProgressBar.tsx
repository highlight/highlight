import Button from '@components/Button/Button/Button';
import SvgDragIcon from '@icons/DragIcon';
import { useReplayerContext } from '@pages/Player/ReplayerContext';
import { useToolbarItemsContext } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext';
import ActivityGraph, {
    ActivityGraphPoint,
} from '@pages/Sessions/SessionsFeedV2/components/ActivityGraph/ActivityGraph';
import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { NumberParam, useQueryParam } from 'use-query-params';

import styles from './ProgressBar.module.scss';

interface Props {
    activityData: ActivityGraphPoint[];
}

const ActivityGraphMemoized = React.memo(ActivityGraph);

const ProgressBar = ({ activityData }: Props) => {
    const {
        zoomAreaLeft,
        setZoomAreaLeft,
        zoomAreaRight,
        setZoomAreaRight,
    } = useToolbarItemsContext();
    const { sessionIntervals } = useReplayerContext();
    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const sliderWrapperRef = useRef<HTMLDivElement>(null);
    const wrapperWidth =
        sliderWrapperRef.current?.getBoundingClientRect().width ?? 1;
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
    const [zoomHistory, setZoomHistory] = useState<[number, number][]>([]);

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
                <div className={styles.activityGraphWrapper}>
                    <ActivityGraphMemoized
                        data={activityData}
                        height={20}
                        disableAnimation
                    ></ActivityGraphMemoized>
                </div>
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
                        className={styles.zoomAreaMask}
                        style={{
                            left: `0`,
                            width: `${dragAreaLeft}%`,
                        }}
                    ></div>
                    <div
                        className={styles.zoomAreaMask}
                        style={{
                            left: `${dragAreaRight}%`,
                            width: `${100 - dragAreaRight}%`,
                        }}
                    ></div>
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
            </div>
        </div>
    );
};

export default ProgressBar;
