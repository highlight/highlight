import useLocalStorage from '@rehooks/local-storage';
import React, { useContext, useState } from 'react';
import Popover from '../../../../components/Popover/Popover';
import { EventsForTimeline } from '../../PlayerHook/utils';
import ReplayerContext, { ParsedHighlightEvent } from '../../ReplayerContext';
import { getEventRenderDetails } from '../../StreamElement/StreamElement';
import StreamElementPayload from '../../StreamElement/StreamElementPayload';
import TimelineAnnotation from './TimelineAnnotation';
import styles from '../Toolbar.module.scss';

interface Props {
    event: ParsedHighlightEvent;
}

const TimelineEventAnnotation = ({ event }: Props) => {
    const { pause, replayer } = useContext(ReplayerContext);
    const details = getEventRenderDetails(event);
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);
    const [
        selectedTimelineAnnotationTypes,
    ] = useLocalStorage('highlightTimelineAnnotationTypes', [
        ...EventsForTimeline,
    ]);

    if (
        !selectedTimelineAnnotationTypes.includes(details.title || ('' as any))
    ) {
        return null;
    }

    return (
        <Popover
            key={event.identifier}
            content={
                <div className={styles.popoverContent}>
                    <StreamElementPayload
                        payload={
                            typeof details.payload === 'object'
                                ? JSON.stringify(details.payload)
                                : details.payload
                        }
                    />
                </div>
            }
            title={details.title}
            onVisibleChange={(visible) => {
                setIsTooltipOpen(visible);
            }}
        >
            <TimelineAnnotation
                isSelected={isTooltipOpen}
                event={event}
                colorKey={
                    (getEventRenderDetails(event).title ||
                        '') as typeof EventsForTimeline[number]
                }
                onClickHandler={() => {
                    if (replayer) {
                        pause(
                            event.timestamp - replayer.getMetaData().startTime
                        );
                    }
                }}
            />
        </Popover>
    );
};

export default TimelineEventAnnotation;
