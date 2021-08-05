import { Checkbox, CheckboxOptionType } from 'antd';
import React from 'react';

import Button from '../../../../components/Button/Button/Button';
import Popover from '../../../../components/Popover/Popover';
import Tooltip from '../../../../components/Tooltip/Tooltip';
import {
    EventsForTimeline,
    EventsForTimelineKeys,
} from '../../PlayerHook/utils';
import usePlayerConfiguration from '../../PlayerHook/utils/usePlayerConfiguration';
import { getAnnotationColor } from '../Toolbar';
import styles from './TimelineAnnotationsSettings.module.scss';

type EventTypesKeys = {
    [key in EventsForTimelineKeys[number]]: string | React.ReactNode;
};

export const EventTypeDescriptions: EventTypesKeys = {
    Segment: (
        <span>
            The client-side segment installation fired a track or identify
            event.{' '}
            <a
                href="https://docs.highlight.run/docs/segment-integration"
                target="_blank"
                rel="noreferrer"
            >
                Learn more
            </a>
        </span>
    ),
    Errors:
        "Any error that shows up in the Developer Tools' Console will be shown",
    Focus: 'An element received either with a mouse or keyboard',
    Navigate:
        "The user is moving around in your application where their transitions don't require a full page reload",
    Reload:
        'The page was reloaded during the session by refreshing the page or opening the app again within the same tab',
    Click: 'A user clicked on an element on the page',
    Track:
        'These are custom calls to Highlights track method for custom logging',
    Comments: 'These are comments created by you and other people on your team',
    Identify:
        'These are custom calls to Highlight identify method to add identity metadata for a session.',
    Viewport: 'The size of the browser changed.',
};

interface Props {
    disabled: boolean;
}

const TimelineAnnotationsSettings = ({ disabled }: Props) => {
    const {
        selectedTimelineAnnotationTypes,
        setSelectedTimelineAnnotationTypes,
    } = usePlayerConfiguration();

    const onSelectChangeHandler = (value: any) => {
        setSelectedTimelineAnnotationTypes(value);
    };

    const checkboxOptions: CheckboxOptionType[] = EventsForTimeline.map(
        (eventType, index) => ({
            label: (
                <Tooltip
                    title={EventTypeDescriptions[eventType]}
                    // We place the tooltip on the same side of the checkbox's column so the tooltip does not cover the other options.
                    placement={index % 2 ? 'right' : 'left'}
                    // We offset the X positioning for the checkboxes on the left column because the tooltip is calculating the width of the label without the checkbox.
                    align={{ offset: [index % 2 ? 0 : -25, 0] }}
                >
                    <span className={styles.checkBoxLabel}>
                        {eventType}
                        <div
                            className={styles.circle}
                            style={{
                                backgroundColor: `var(${getAnnotationColor(
                                    eventType
                                )})`,
                            }}
                        />
                    </span>
                </Tooltip>
            ),
            value: eventType,
        })
    );

    return (
        <Popover
            trigger="click"
            content={
                <div className={styles.contentWrapper}>
                    <p>
                        Timeline annotations are the circles above the timeline.
                        You can configure what types of events are drawn as
                        annotations.
                    </p>
                    <Checkbox.Group
                        defaultValue={selectedTimelineAnnotationTypes}
                        onChange={onSelectChangeHandler}
                        className={styles.checkboxGroup}
                    >
                        <div className={styles.checkboxesContainer}>
                            {checkboxOptions.map(({ label, value }) => (
                                <div key={value.toString()}>
                                    <Checkbox value={value}>{label}</Checkbox>
                                </div>
                            ))}
                        </div>
                    </Checkbox.Group>
                </div>
            }
        >
            <Button
                type="text"
                className={styles.button}
                trackingId="TimelineAnnotationSettings"
                disabled={disabled}
            >
                <div className={styles.eventTypesContainer}>
                    {selectedTimelineAnnotationTypes
                        //     Show at most 3 dots
                        .slice(0, 3)
                        .map((eventType) => (
                            <div
                                key={eventType}
                                className={styles.eventType}
                                style={{
                                    backgroundColor: `var(${getAnnotationColor(
                                        eventType
                                    )})`,
                                }}
                            ></div>
                        ))}
                    <span className={styles.label}>
                        {selectedTimelineAnnotationTypes.length} types...
                    </span>
                </div>
            </Button>
        </Popover>
    );
};

export default TimelineAnnotationsSettings;
