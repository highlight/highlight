import { EventType } from '@highlight-run/rrweb';
import { customEvent } from '@highlight-run/rrweb/typings/types';
import React, { useContext, useEffect, useState } from 'react';
import ReplayerContext from '../ReplayerContext';
import styles from './index.module.scss';

interface Props {
    replayerWidth?: number;
}

export const SessionDetails = ({ replayerWidth }: Props) => {
    const { events, replayer } = useContext(ReplayerContext);
    const [currentUrl, setCurrentUrl] = useState<string>('');

    // Finds the first Navigate event to set the initial URL.
    useEffect(() => {
        let initialUrl = '';
        let index = 0;
        let event = events[index];

        while (initialUrl === '' || index < events.length) {
            if (event.type === EventType.Custom) {
                const typedEvent = event as customEvent<string>;

                if (typedEvent.data.tag === 'Navigate') {
                    initialUrl = typedEvent.data.payload;
                    break;
                }
            }
            index++;
            event = events[index];
        }

        setCurrentUrl(initialUrl);
    }, [events]);

    useEffect(() => {
        if (replayer) {
            replayer.on('event-cast', (e) => {
                const event = e as customEvent<string>;
                if (event.data.tag === 'Navigate') {
                    setCurrentUrl(event.data.payload);
                }
            });
        }
    }, [replayer]);

    return (
        <div className={styles.wrapper} style={{ width: replayerWidth }}>
            <span>{currentUrl}</span>
        </div>
    );
};
