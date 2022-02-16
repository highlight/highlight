import { getFullScreenPopoverGetPopupContainer } from '@pages/Player/context/PlayerUIContext';
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

    if (
        !selectedTimelineAnnotationTypes.includes(details.title || ('' as any))
    ) {
        return null;
    }
    const Icon = getPlayerEventIcon(details.title || '');

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
