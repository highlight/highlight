import { message } from 'antd';
import React, { useState } from 'react';

import Popover from '../../../../components/Popover/Popover';
import { MillisToMinutesAndSeconds } from '../../../../util/time';
import { EventsForTimeline } from '../../PlayerHook/utils';
import usePlayerConfiguration from '../../PlayerHook/utils/usePlayerConfiguration';
import {
    ParsedHighlightEvent,
    useReplayerContext,
} from '../../ReplayerContext';
import {
    getEventRenderDetails,
    getPlayerEventIcon,
} from '../../StreamElement/StreamElement';
import StreamElementPayload from '../../StreamElement/StreamElementPayload';
import { TimelineAnnotationColors } from '../Toolbar';
import styles from '../Toolbar.module.scss';
import TimelineAnnotation from './TimelineAnnotation';
import timelineAnnotationStyles from './TimelineAnnotation.module.scss';

interface Props {
    event: ParsedHighlightEvent;
}

const TimelineEventAnnotation = ({ event }: Props) => {
    const { pause, replayer } = useReplayerContext();
    const details = getEventRenderDetails(event);
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);
    const { selectedTimelineAnnotationTypes } = usePlayerConfiguration();

    if (
        !selectedTimelineAnnotationTypes.includes(details.title || ('' as any))
    ) {
        return null;
    }
    const Icon = getPlayerEventIcon(details.title || '');

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
            title={
                <span className={timelineAnnotationStyles.title}>
                    <span
                        className={timelineAnnotationStyles.iconContainer}
                        style={{
                            background: `var(${
                                // @ts-ignore
                                TimelineAnnotationColors[details.title]
                            })`,
                        }}
                    >
                        {Icon}
                    </span>
                    {details.title}
                </span>
            }
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
                        const newTime =
                            event.timestamp - replayer.getMetaData().startTime;

                        pause(newTime);
                        message.success(
                            `Changed player time to where event was created at ${MillisToMinutesAndSeconds(
                                newTime
                            )}.`
                        );
                    }
                }}
            />
        </Popover>
    );
};

export default TimelineEventAnnotation;
