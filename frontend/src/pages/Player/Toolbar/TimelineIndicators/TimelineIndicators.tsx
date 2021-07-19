import useLocalStorage from '@rehooks/local-storage';
import classNames from 'classnames';
import React from 'react';

import { EventsForTimeline } from '../../PlayerHook/utils';
import {
    ParsedErrorObject,
    ParsedHighlightEvent,
    ParsedSessionComment,
} from '../../ReplayerContext';
import { useDevToolsContext } from '../DevToolsContext/DevToolsContext';
import styles from './TimelineIndicators.module.scss';

interface Props {
    events?: ParsedHighlightEvent[];
    errors?: ParsedErrorObject[];
    comments?: ParsedSessionComment[];
}

const TimelineIndicators = (props: Props) => {
    const [
        selectedEventTypes,
    ] = useLocalStorage('highlightTimelineAnnotationTypes', [
        ...EventsForTimeline,
    ]);
    const { openDevTools } = useDevToolsContext();

    if (selectedEventTypes.length === 0) {
        return null;
    }

    return (
        <aside
            className={classNames(styles.container, {
                [styles.withDevtoolsOpen]: openDevTools,
            })}
        >
            <div>Hello</div>
        </aside>
    );
};

export default TimelineIndicators;
