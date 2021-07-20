import useLocalStorage from '@rehooks/local-storage';
import classNames from 'classnames';
import React from 'react';

import { EventsForTimeline } from '../../PlayerHook/utils';
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
    } = useReplayerContext();
    const [
        selectedEventTypes,
    ] = useLocalStorage('highlightTimelineAnnotationTypes', [
        ...EventsForTimeline,
    ]);
    const { openDevTools } = useDevToolsContext();

    if (
        selectedEventTypes.length === 0 ||
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

    return (
        <aside
            className={classNames(styles.container, {
                [styles.withDevtoolsOpen]: openDevTools,
            })}
        >
            {selectedEventTypes.includes('Errors') &&
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
            {selectedEventTypes.includes('Comments') &&
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
        </aside>
    );
};

export default TimelineIndicators;
