import React, { useContext, useEffect, useState } from 'react';
import styles from './SessionLevelBar.module.scss';
import SessionToken from './SessionToken/SessionToken';
import { ReactComponent as LayoutIcon } from '../../../static/layout.svg';
import ActivityIcon from './ActivityIcon/ActivityIcon';
import ReplayerContext, { ReplayerState } from '../ReplayerContext';
import { ReplayerEvents } from '@highlight-run/rrweb';
import { customEvent } from '@highlight-run/rrweb/dist/types';
import { findFirstEventOfType } from './utils/utils';
import Skeleton from 'react-loading-skeleton';
import { CurrentUrlBar } from './CurrentUrlBar/CurrentUrlBar';

interface Viewport {
    height: number;
    width: number;
}

const SessionLevelBar = () => {
    const { replayer, state, events } = useContext(ReplayerContext);
    const [currentUrl, setCurrentUrl] = useState<string | undefined>(undefined);
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
        if (!events.length) return;
        if (!currentUrl && !viewport) {
            const firstNavigateEvent = findFirstEventOfType(events, [
                'Navigate',
                'Reload',
            ]) as customEvent<string>;

            setCurrentUrl(firstNavigateEvent?.data.payload || 'unknown.url');

            const firstViewportEvent = findFirstEventOfType(events, [
                'Viewport',
            ]) as customEvent<Viewport>;

            setViewport(
                firstViewportEvent?.data.payload || { height: 0, width: 0 }
            );
        }
    }, [currentUrl, events, viewport]);

    const isLoading =
        (state === ReplayerState.Loading && !events.length) ||
        !viewport ||
        !currentUrl;

    return (
        <div className={styles.sessionLevelBarContainer}>
            {isLoading ? (
                <div className={styles.skeletonContainer}>
                    <Skeleton count={1} width="100%" height="100%" />
                </div>
            ) : (
                <>
                    <SessionToken
                        icon={<LayoutIcon />}
                        tooltipTitle="The user's current viewport size in pixels."
                    >
                        {viewport?.height} x {viewport?.width}
                    </SessionToken>
                    <CurrentUrlBar url={currentUrl ?? ''} />
                </>
            )}
        </div>
    );
};

export default SessionLevelBar;
