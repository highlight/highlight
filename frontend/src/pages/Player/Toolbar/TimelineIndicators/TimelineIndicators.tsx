import { useAuthContext } from '@authentication/AuthContext';
import RageClickSpan from '@pages/Player/Toolbar/RageClickSpan/RageClickSpan';
import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';

import usePlayerConfiguration from '../../PlayerHook/utils/usePlayerConfiguration';
import {
    ParsedSessionInterval,
    RageClick,
    ReplayerState,
    useReplayerContext,
} from '../../ReplayerContext';
import { useDevToolsContext } from '../DevToolsContext/DevToolsContext';
import TimelineCommentAnnotation from '../TimelineAnnotation/TimelineCommentAnnotation';
import TimelineErrorAnnotation from '../TimelineAnnotation/TimelineErrorAnnotation';
import TimelineEventAnnotation from '../TimelineAnnotation/TimelineEventAnnotation';
import styles from './TimelineIndicators.module.scss';

interface Props {
    openDevTools: boolean;
    refContainer: React.RefObject<HTMLDivElement>;
    sessionIntervals: ParsedSessionInterval[];
    isHighlightAdmin: boolean;
    selectedTimelineAnnotationTypes: string[];
    rageClicks: RageClick[];
    startTime: number | undefined;
    pause: (time?: number | undefined) => void;
}

const TimelineIndicatorsMemoized = React.memo(
    ({
        openDevTools,
        refContainer,
        sessionIntervals,
        isHighlightAdmin,
        selectedTimelineAnnotationTypes,
        rageClicks,
        startTime,
        pause,
    }: Props) => {
        return (
            <aside
                className={classNames(styles.container, {
                    [styles.withDevtoolsOpen]: openDevTools,
                })}
                ref={refContainer}
            >
                {sessionIntervals.map((sessionInterval, index) => (
                    <div
                        key={`${sessionInterval.startPercent}-${index}`}
                        className={classNames(styles.sessionInterval, {
                            [styles.active]: sessionInterval.active,
                        })}
                        style={{
                            left: `${sessionInterval.startPercent * 100}%`,
                            width: `${
                                (sessionInterval.endPercent -
                                    sessionInterval.startPercent) *
                                100
                            }%`,
                        }}
                    >
                        {sessionInterval.sessionEvents.map((event) => (
                            <TimelineEventAnnotation
                                event={event}
                                startTime={startTime}
                                selectedTimelineAnnotationTypes={
                                    selectedTimelineAnnotationTypes
                                }
                                pause={pause}
                                key={`${event.timestamp}-${event.identifier}`}
                            />
                        ))}
                        {selectedTimelineAnnotationTypes.includes('Errors') &&
                            sessionInterval.errors.map((error) => (
                                <TimelineErrorAnnotation
                                    error={error}
                                    key={`${error.timestamp}-${error.id}`}
                                />
                            ))}
                        {selectedTimelineAnnotationTypes.includes('Comments') &&
                            sessionInterval.comments.map((comment) => {
                                return (
                                    <TimelineCommentAnnotation
                                        comment={comment}
                                        key={comment.id}
                                    />
                                );
                            })}
                        {isHighlightAdmin &&
                            selectedTimelineAnnotationTypes.includes('Click') &&
                            rageClicks
                                .filter(
                                    (rageClick) =>
                                        rageClick.sessionIntervalIndex === index
                                )
                                .map((rageClick) => (
                                    <RageClickSpan
                                        rageClick={rageClick}
                                        key={rageClick.startTimestamp}
                                    />
                                ))}
                    </div>
                ))}
            </aside>
        );
    }
);

const TimelineIndicators = () => {
    const {
        state,
        replayer,
        rageClicks,
        sessionIntervals,
        pause,
    } = useReplayerContext();
    const {
        selectedTimelineAnnotationTypes,
        setSelectedTimelineAnnotationTypes,
    } = usePlayerConfiguration();
    const { openDevTools } = useDevToolsContext();
    const refContainer = useRef<HTMLDivElement>(null);

    const { isHighlightAdmin } = useAuthContext();

    useEffect(() => {
        if (
            isHighlightAdmin &&
            rageClicks.length > 0 &&
            !selectedTimelineAnnotationTypes.includes('Click') &&
            (state === ReplayerState.LoadedWithDeepLink ||
                state === ReplayerState.Empty ||
                state === ReplayerState.LoadedAndUntouched)
        ) {
            setSelectedTimelineAnnotationTypes([
                ...selectedTimelineAnnotationTypes,
                'Click',
            ]);
        }
    }, [
        isHighlightAdmin,
        rageClicks.length,
        selectedTimelineAnnotationTypes,
        setSelectedTimelineAnnotationTypes,
        state,
    ]);

    if (
        selectedTimelineAnnotationTypes.length === 0 ||
        state === ReplayerState.Loading ||
        !replayer
    ) {
        return null;
    }

    return (
        <TimelineIndicatorsMemoized
            openDevTools={openDevTools}
            refContainer={refContainer}
            sessionIntervals={sessionIntervals}
            isHighlightAdmin={isHighlightAdmin}
            selectedTimelineAnnotationTypes={selectedTimelineAnnotationTypes}
            rageClicks={rageClicks}
            startTime={replayer?.getMetaData()?.startTime}
            pause={pause}
        ></TimelineIndicatorsMemoized>
    );
};

export default TimelineIndicators;
