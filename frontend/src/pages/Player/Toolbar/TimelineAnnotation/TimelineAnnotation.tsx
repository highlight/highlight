import React from 'react';
import { ParsedEvent } from '../../ReplayerContext';
import { getAnnotationColor } from '../Toolbar';
import styles from './TimelineAnnotation.module.scss';

interface Props {
    event: ParsedEvent;
    colorKey: string;
    onClickHandler: () => void;
}

const TimelineAnnotation = ({
    event,
    colorKey,
    onClickHandler,
    ...props
}: Props) => {
    const baseStyles = {
        left: `${event.relativeIntervalPercentage}%`,
        backgroundColor: `var(${getAnnotationColor(colorKey)})`,
    };

    return (
        <button
            {...props}
            className={styles.annotation}
            style={baseStyles}
            onClick={onClickHandler}
        ></button>
    );
};

export default TimelineAnnotation;
