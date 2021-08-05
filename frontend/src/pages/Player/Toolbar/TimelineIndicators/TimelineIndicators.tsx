import classNames from 'classnames';
import React, { useRef } from 'react';

import usePlayerConfiguration from '../../PlayerHook/utils/usePlayerConfiguration';
import { ReplayerState, useReplayerContext } from '../../ReplayerContext';
import { useDevToolsContext } from '../DevToolsContext/DevToolsContext';
import TimelineCommentAnnotation from '../TimelineAnnotation/TimelineCommentAnnotation';
import TimelineErrorAnnotation from '../TimelineAnnotation/TimelineErrorAnnotation';
import TimelineEventAnnotation from '../TimelineAnnotation/TimelineEventAnnotation';
import styles from './TimelineIndicators.module.scss';

const TimelineIndicators = () => {
    const {
        state,
        replayer,
        errors,
        sessionComments,
        eventsForTimelineIndicator,
        playerProgress,
    } = useReplayerContext();
    const { selectedTimelineAnnotationTypes } = usePlayerConfiguration();
    const { openDevTools } = useDevToolsContext();
    const refContainer = useRef<HTMLDivElement>(null);

    if (
        selectedTimelineAnnotationTypes.length === 0 ||
        state === ReplayerState.Loading ||
        !replayer
    ) {
        return null;
    }
    const sessionStartTime = new Date(
        replayer.getMetaData().startTime
    ).getTime();
    const sessionTotalTime = replayer.getMetaData().totalTime;
    const errorsWithTimestamps = errors
        .filter((error) => !!error.timestamp)
        .sort((a, b) => b.timestamp - a.timestamp);

    const playerProgressIndicatorPosition =
        !refContainer.current || !playerProgress
            ? 0
            : refContainer.current.clientWidth * playerProgress;

    return (
        <aside
            className={classNames(styles.container, {
                [styles.withDevtoolsOpen]: openDevTools,
            })}
            ref={refContainer}
        >
            {selectedTimelineAnnotationTypes.includes('Errors') &&
                errorsWithTimestamps.map((error) => {
                    const relativeTimestamp =
                        new Date(error.timestamp).getTime() - sessionStartTime;
                    const percentage =
                        (relativeTimestamp / sessionTotalTime) * 100;

                    if (percentage > 100) {
                        return null;
                    }

                    return (
                        <TimelineErrorAnnotation
                            key={error.id}
                            error={{
                                ...error,
                                relativeIntervalPercentage: percentage,
                            }}
                        />
                    );
                })}
            {selectedTimelineAnnotationTypes.includes('Comments') &&
                sessionComments.map((comment) => {
                    return (
                        <TimelineCommentAnnotation
                            comment={comment}
                            key={comment.id}
                        />
                    );
                })}
            {eventsForTimelineIndicator.map((event, index) => {
                return (
                    <TimelineEventAnnotation
                        event={event}
                        key={`${event.timestamp}-${index}`}
                    />
                );
            })}
            {playerProgress && playerProgress >= 0.01 ? (
                <div
                    className={styles.progressIndicator}
                    style={{
                        transform: `translateX(${playerProgressIndicatorPosition}px)`,
                    }}
                />
            ) : null}
        </aside>
    );
};

export default TimelineIndicators;
