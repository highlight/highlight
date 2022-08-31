import CheckboxList from '@components/CheckboxList/CheckboxList';
import { getFullScreenPopoverGetPopupContainer } from '@pages/Player/context/PlayerUIContext';
import React from 'react';

import Button from '../../../../components/Button/Button/Button';
import Popover from '../../../../components/Popover/Popover';
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

export const EventTypeDescriptions: Omit<
    EventTypesKeys,
    'Web Vitals' | 'Referrer'
> = {
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
    Errors: "Any error that shows up in the Developer Tools' Console will be shown",
    Focus: 'An element received either with a mouse or keyboard',
    Navigate:
        "The user is moving around in your application where their transitions don't require a full page reload",
    Reload: 'The page was reloaded during the session by refreshing the page or opening the app again within the same tab',
    Click: 'A user clicked on an element on the page',
    Track: 'These are custom calls to Highlights track method for custom logging',
    Comments: 'These are comments created by you and other people on your team',
    Identify:
        'These are custom calls to Highlight identify method to add identity metadata for a session.',
    Viewport: 'The size of the browser changed.',
    TabHidden: 'The user switched away from the current tab.',
};

interface Props {
    disabled: boolean;
}

const EventTypeToExclude: string[] = ['Web Vitals'];

const TimelineAnnotationsSettings = React.memo(({ disabled }: Props) => {
    const {
        selectedTimelineAnnotationTypes,
        setSelectedTimelineAnnotationTypes,
    } = usePlayerConfiguration();

    return (
        <Popover
            getPopupContainer={getFullScreenPopoverGetPopupContainer}
            trigger="click"
            content={
                <div className={styles.contentWrapper}>
                    <p>
                        Timeline annotations are the circles above the timeline.
                        You can configure what types of events are drawn as
                        annotations.
                    </p>
                    <CheckboxList
                        checkboxOptions={EventsForTimeline.filter(
                            (eventType) =>
                                !EventTypeToExclude.includes(eventType)
                        ).map((eventType) => ({
                            checked:
                                selectedTimelineAnnotationTypes.includes(
                                    eventType
                                ),
                            label: (
                                <div className={styles.checkBoxLabel}>
                                    <div
                                        className={styles.circle}
                                        style={{
                                            backgroundColor: `var(${getAnnotationColor(
                                                eventType
                                            )})`,
                                        }}
                                    />
                                    {getTimelineEventDisplayName(eventType)}
                                </div>
                            ),
                            key: eventType,
                            onChange: (e) => {
                                if (!e.target.checked) {
                                    setSelectedTimelineAnnotationTypes(
                                        selectedTimelineAnnotationTypes.filter(
                                            (type) => type !== eventType
                                        )
                                    );
                                } else {
                                    setSelectedTimelineAnnotationTypes([
                                        ...selectedTimelineAnnotationTypes,
                                        eventType,
                                    ]);
                                }
                            },
                        }))}
                        containerClassName={styles.checkboxesContainer}
                        onSelectAll={() => {
                            setSelectedTimelineAnnotationTypes(
                                EventsForTimeline.map((type) => type)
                            );
                        }}
                        onSelectOne={(key) => {
                            setSelectedTimelineAnnotationTypes([key as any]);
                        }}
                    />
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
});

export default TimelineAnnotationsSettings;

export const getTimelineEventDisplayName = (name: string) => {
    switch (name) {
        case 'TabHidden':
            return 'Tab State';
        default:
            return name;
    }
};
