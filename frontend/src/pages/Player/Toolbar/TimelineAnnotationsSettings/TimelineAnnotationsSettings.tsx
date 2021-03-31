import useLocalStorage from '@rehooks/local-storage';
import { Checkbox, Popover, CheckboxOptionType } from 'antd';
import React from 'react';
import TransparentButton from '../../../../components/Button/TransparentButton/TransparentButton';
import { EventsForTimeline } from '../../PlayerHook/utils';
import { getAnnotationColor } from '../Toolbar';
import styles from './TimelineAnnotationsSettings.module.scss';

const TimelineAnnotationsSettings = () => {
    const [
        selectedEventTypes,
        setSelectedEventTypes,
    ] = useLocalStorage('highlightTimelineAnnotationTypes', [
        ...EventsForTimeline,
    ]);

    const onSelectChangeHandler = (value: any) => {
        setSelectedEventTypes(value);
    };

    const checkboxOptions: CheckboxOptionType[] = EventsForTimeline.map(
        (eventType) => ({
            label: (
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
            ),
            value: eventType,
        })
    );

    return (
        <Popover
            trigger="click"
            content={
                <div>
                    <p>
                        Timeline annotations are the circles above the timeline.
                        You can configure what types of events are drawn as
                        annotations.
                    </p>
                    <Checkbox.Group
                        defaultValue={selectedEventTypes}
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
            overlayStyle={{ maxWidth: `300px` }}
        >
            <TransparentButton className={styles.button}>
                <div className={styles.eventTypesContainer}>
                    {selectedEventTypes.map((eventType) => (
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
                        {selectedEventTypes.length} types...
                    </span>
                </div>
            </TransparentButton>
        </Popover>
    );
};

export default TimelineAnnotationsSettings;
