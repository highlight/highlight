import { useAuthContext } from '@authentication/AuthContext';
import HighlightGate from '@components/HighlightGate/HighlightGate';
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext';
import { HighlightEvent } from '@pages/Player/HighlightEvent';
import RageClickSpan from '@pages/Player/Toolbar/RageClickSpan/RageClickSpan';
import TimelineIndicatorsBarGraph from '@pages/Player/Toolbar/TimelineIndicators/TimelineIndicatorsBarGraph/TimelineIndicatorsBarGraph';
import classNames from 'classnames';
import { AnimatePresence } from 'framer-motion';
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
    selectedTimelineAnnotationTypes: string[];
    rageClicks: RageClick[];
    startTime: number;
    pause: (time?: number | undefined) => void;
    activeEvent: HighlightEvent | undefined;
}

const TimelineIndicatorsMemoized = React.memo(
    ({
        refContainer,
        sessionIntervals,
        selectedTimelineAnnotationTypes,
        rageClicks,
        startTime,
        pause,
        activeEvent,
    }: Props) => {
        return (
            <AnimatePresence presenceAffectsLayout>
                <aside
                    className={classNames(styles.container)}
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
                            {sessionInterval.sessionEvents.map((event) => {
                                const intervalWidth = sessionInterval.active
                                    ? sessionInterval.endPercent -
                                      sessionInterval.startPercent
                                    : 0.01;
                                // calculate the event position percentage, relative to the entire timeline.
                                // i.e. each event start is weighted relative to the size of the interval it is in,
                                // since inactive intervals have a fixed small size.
                                const relativeStart =
                                    sessionInterval.startPercent +
                                    intervalWidth *
                                        ((event.timestamp -
                                            startTime -
                                            sessionIntervals[index].startTime) /
                                            sessionInterval.duration);
                                return (
                                    <TimelineEventAnnotation
                                        event={event}
                                        startTime={startTime}
                                        relativeStartPercent={relativeStart}
                                        selectedTimelineAnnotationTypes={
                                            selectedTimelineAnnotationTypes
                                        }
                                        pause={pause}
                                        key={`${event.timestamp}-${event.identifier}`}
                                        activeEvent={activeEvent}
                                    />
                                );
                            })}
                            {selectedTimelineAnnotationTypes.includes(
                                'Errors'
                            ) &&
                                sessionInterval.errors.map((error) => (
                                    <TimelineErrorAnnotation
                                        error={error}
                                        key={`${error.timestamp}-${error.id}`}
                                    />
                                ))}
                            {selectedTimelineAnnotationTypes.includes(
                                'Comments'
                            ) &&
                                sessionInterval.comments.map((comment) => {
                                    return (
                                        <TimelineCommentAnnotation
                                            comment={comment}
                                            key={comment.id}
                                        />
                                    );
                                })}
                            {selectedTimelineAnnotationTypes.includes(
                                'Click'
                            ) &&
                                rageClicks
                                    .filter(
                                        (rageClick) =>
                                            rageClick.sessionIntervalIndex ===
                                            index
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
            </AnimatePresence>
        );
    }
);

const TimelineIndicators = React.memo(() => {
    const {
        state,
        replayer,
        rageClicks,
        sessionIntervals,
        pause,
        sessionMetadata,
    } = useReplayerContext();
    const {
        selectedTimelineAnnotationTypes,
        setSelectedTimelineAnnotationTypes,
    } = usePlayerConfiguration();
    const { openDevTools } = useDevToolsContext();
    const refContainer = useRef<HTMLDivElement>(null);

    const { isHighlightAdmin } = useAuthContext();
    const { activeEvent } = usePlayerUIContext();

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

    if (state === ReplayerState.Loading || !replayer) {
        return null;
    }

    return (
        <>
            <HighlightGate featureIsOn={false}>
                <TimelineIndicatorsBarGraph
                    sessionIntervals={sessionIntervals}
                    selectedTimelineAnnotationTypes={
                        selectedTimelineAnnotationTypes
                    }
                />
            </HighlightGate>
            <TimelineIndicatorsMemoized
                openDevTools={openDevTools}
                refContainer={refContainer}
                sessionIntervals={sessionIntervals}
                selectedTimelineAnnotationTypes={
                    selectedTimelineAnnotationTypes
                }
                rageClicks={rageClicks}
                startTime={sessionMetadata.startTime || 0}
                pause={pause}
                activeEvent={activeEvent}
            />
        </>
    );
});

export default TimelineIndicators;
