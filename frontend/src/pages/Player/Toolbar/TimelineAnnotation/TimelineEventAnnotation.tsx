import {
    getFullScreenPopoverGetPopupContainer,
    usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext';
import { getTimelineEventDisplayName } from '@pages/Player/Toolbar/TimelineAnnotationsSettings/TimelineAnnotationsSettings';
import { message } from 'antd';
import React, { useState } from 'react';

import Popover from '../../../../components/Popover/Popover';
import { MillisToMinutesAndSeconds } from '../../../../util/time';
import { EventsForTimeline } from '../../PlayerHook/utils';
import { ParsedHighlightEvent } from '../../ReplayerContext';
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
    startTime: number | undefined;
    selectedTimelineAnnotationTypes: string[];
    pause: (time?: number | undefined) => void;
}

const TimelineEventAnnotation = ({
    event,
    startTime,
    selectedTimelineAnnotationTypes,
    pause,
}: Props) => {
    const details = getEventRenderDetails(event);
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);
    const { activeEvent } = usePlayerUIContext();

    const Icon = getPlayerEventIcon(details.title || '', details.payload);

    return (
        <Popover
            getPopupContainer={getFullScreenPopoverGetPopupContainer}
            key={event.identifier}
            popoverClassName={timelineAnnotationStyles.popover}
            content={
                <div className={styles.popoverContent}>
                    <StreamElementPayload
                        payload={
                            typeof details.payload === 'object'
                                ? JSON.stringify(details.payload)
                                : typeof details.payload === 'boolean' &&
                                  details.title?.includes('Tab')
                                ? details.payload
                                    ? 'The user switched away from this tab.'
                                    : 'The user is currently active on this tab.'
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
                    {getTimelineEventDisplayName(details.title || '')}
                </span>
            }
            onVisibleChange={(visible) => {
                setIsTooltipOpen(visible);
            }}
        >
            <TimelineAnnotation
                hidden={
                    !selectedTimelineAnnotationTypes.includes(
                        details.title || ('' as any)
                    ) && activeEvent?.identifier !== event.identifier
                }
                isActive={activeEvent?.identifier === event.identifier}
                isSelected={isTooltipOpen}
                event={event}
                colorKey={
                    (getEventRenderDetails(event).title ||
                        '') as typeof EventsForTimeline[number]
                }
                onClickHandler={() => {
                    if (startTime) {
                        const newTime = event.timestamp - startTime;

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
