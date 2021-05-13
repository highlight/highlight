import classNames from 'classnames';
import React from 'react';

import { EventsForTimeline } from '../../PlayerHook/utils';
import { ParsedEvent } from '../../ReplayerContext';
import { getAnnotationColor } from '../Toolbar';
import styles from './TimelineAnnotation.module.scss';

interface Props {
    event: ParsedEvent;
    colorKey: typeof EventsForTimeline[number];
    onClickHandler: () => void;
    isSelected?: boolean;
}

const TimelineAnnotation = ({
    event,
    colorKey,
    onClickHandler,
    isSelected,
    ...props
}: Props) => {
    const baseStyles = {
        left: `calc(${event.relativeIntervalPercentage}% - calc(var(--size) / 2))`,
        backgroundColor: `var(${getAnnotationColor(colorKey)})`,
    };

    return (
        <button
            {...props}
            className={classNames(styles.annotation, {
                [styles.selected]: isSelected,
            })}
            style={baseStyles}
            onClick={onClickHandler}
        ></button>
    );
};

export default TimelineAnnotation;
