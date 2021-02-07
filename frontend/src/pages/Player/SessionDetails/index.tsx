import { EventType } from '@highlight-run/rrweb';
import { customEvent } from '@highlight-run/rrweb/typings/types';
import classNames from 'classnames';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DemoContext } from '../../../DemoContext';
import { useGetSessionQuery } from '../../../graph/generated/hooks';
import ReplayerContext from '../ReplayerContext';
import styles from './index.module.scss';
import { ReactComponent as LaptopIcon } from '../../../static/laptop.svg';

export const SessionDetails = () => {
    const { demo } = useContext(DemoContext);
    const { session_id } = useParams<{ session_id: string }>();

    const { data } = useGetSessionQuery({
        variables: {
            id: demo ? process.env.REACT_APP_DEMO_SESSION ?? '0' : session_id,
        },
        context: { headers: { 'Highlight-Demo': demo } },
    });
    const { events, replayer, scale } = useContext(ReplayerContext);
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

    /**
     * Calculates the X position for the component.
     */
    const calculateTopOffset = () => {
        const replayerTop = replayer?.wrapper.offsetTop || 0;
        const replayerHeight = replayer?.wrapper.clientHeight || 0;

        // The Replayer is scaled up/down on the DOM. Because of this, the height we get from the DOM node is not height that is rendered. To get the actual height, we scale the reported height.
        return replayerTop - (replayerHeight * scale) / 2;
    };

    /**
     * Calculates the width of the component. This width is the same as the Replayer.
     */
    const calculateWidth = () => {
        return scale * (replayer?.wrapper?.clientWidth ?? 0);
    };

    return (
        <div
            className={styles.wrapper}
            style={{
                width: calculateWidth(),
                top: calculateTopOffset(),
            }}
        >
            <span className={classNames(styles.token, styles.urlToken)}>
                <a href={currentUrl} className={styles.urlToken}>
                    {currentUrl}
                </a>
            </span>
            {data?.session && (
                <span className={styles.token}>
                    <LaptopIcon className={styles.icon} />
                    {data.session.os_name} - {data.session.browser_name}
                </span>
            )}
        </div>
    );
};
