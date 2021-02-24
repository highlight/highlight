import React, { useContext, useEffect, useState } from 'react';
import styles from './SessionLevelBar.module.scss';
import SessionToken from './SessionToken/SessionToken';
import { ReactComponent as BrowserIcon } from '../../../static/browser.svg';
import { ReactComponent as URLIcon } from '../../../static/link.svg';
import ActivityIcon from './ActivityIcon/ActivityIcon';
import ReplayerContext, { ReplayerState } from '../ReplayerContext';
import { ReplayerEvents } from '@highlight-run/rrweb';
import { customEvent } from '@highlight-run/rrweb/dist/types';
import { findFirstEventOfType } from './utils/utils';

interface Viewport {
    height: number;
    width: number;
}

const SessionLevelBar = () => {
    const { replayer, state, events } = useContext(ReplayerContext);
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);
    const [isTabActive, setIsTabActive] = useState<boolean>(true);
    const [viewport, setViewport] = useState<Viewport | null>(null);

    // Subscribes to the Replayer for relevant events.
    useEffect(() => {
        if (replayer) {
            replayer.on(ReplayerEvents.EventCast, (e) => {
                const event = e as customEvent<string>;
                switch (event.data.tag) {
                    case 'Navigate':
                    case 'Reload':
                        setCurrentUrl(event.data.payload);
                        return;
                    case 'Tab':
                        setIsTabActive(event.data.payload === 'Active');
                        return;
                    case 'Viewport': {
                        const viewportObject = (event.data
                            .payload as unknown) as Viewport;
                        if (viewportObject?.height && viewportObject?.width) {
                            setViewport(viewportObject);
                        }
                        return;
                    }
                    default:
                        return;
                }
            });
        }
    }, [replayer]);

    // Finds the first relevant events.
    useEffect(() => {
        if (events.length > 0 && !currentUrl && !viewport) {
            const firstNavigateEvent = findFirstEventOfType(events, [
                'Navigate',
                'Reload',
            ]) as customEvent<string>;

            setCurrentUrl(firstNavigateEvent?.data.payload || currentUrl);

            const firstViewportEvent = findFirstEventOfType(events, [
                'Viewport',
            ]) as customEvent<Viewport>;

            setViewport(firstViewportEvent?.data.payload);
        }
    }, [currentUrl, events, viewport]);

    const isLoading = state === ReplayerState.Loading && !events.length;

    return (
        <div className={styles.sessionLevelBarContainer}>
            {((isLoading && !viewport) || (!isLoading && viewport)) && (
                <SessionToken
                    icon={<BrowserIcon />}
                    isLoading={isLoading}
                    tooltipTitle="The user's current viewport size in pixels."
                >
                    {viewport && (
                        <>
                            {viewport.height} x {viewport.width}
                        </>
                    )}
                </SessionToken>
            )}
            <SessionToken
                icon={<URLIcon />}
                isLoading={isLoading}
                tooltipTitle="The current URL the user is on."
            >
                {currentUrl}
            </SessionToken>
            <SessionToken
                icon={<ActivityIcon isActive={isTabActive} />}
                isLoading={isLoading}
                tooltipTitle="Indicates whether the user has this page as the active tab. If the user is on a different tab or window then the session will be inactive."
            >
                {isTabActive ? 'Active' : 'Inactive'}
            </SessionToken>
        </div>
    );
};

export default SessionLevelBar;
