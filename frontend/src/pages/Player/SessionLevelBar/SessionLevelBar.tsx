import { ReplayerEvents } from '@highlight-run/rrweb';
import { customEvent } from '@highlight-run/rrweb/dist/types';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import SvgDimensionsIcon from '../../../static/DimensionsIcon';
import { ReplayerState, useReplayerContext } from '../ReplayerContext';
import SessionShareButton from '../SessionShareButton/SessionShareButton';
import { CurrentUrlBar } from './CurrentUrlBar/CurrentUrlBar';
import styles from './SessionLevelBar.module.scss';
import SessionToken from './SessionToken/SessionToken';
import { findFirstEventOfType } from './utils/utils';

interface Viewport {
    height: number;
    width: number;
}

const SessionLevelBar = () => {
    const { replayer, state, events, session } = useReplayerContext();
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
            replayer.on(ReplayerEvents.Resize, (_e) => {
                const e = _e as { width: number; height: number };
                setViewport({ height: e.height, width: e.width });
            });
        }
    }, [replayer]);

    // Finds the first relevant events.
    useEffect(() => {
        if (!events.length) return;
        if (
            state === ReplayerState.LoadedAndUntouched ||
            state === ReplayerState.LoadedWithDeepLink
        ) {
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
    }, [events, state]);

    const isLoading =
        (state === ReplayerState.Loading && !events.length) ||
        !viewport ||
        !currentUrl ||
        !session;

    return (
        <div className={styles.container}>
            <div className={styles.sessionLevelBarContainer}>
                {isLoading ? (
                    <div className={styles.skeletonContainer}>
                        <Skeleton count={1} width="100%" height="100%" />
                    </div>
                ) : (
                    <>
                        <CurrentUrlBar url={currentUrl ?? ''} />
                        <SessionToken
                            icon={<SvgDimensionsIcon />}
                            tooltipTitle="The user's current viewport size in pixels."
                        >
                            {viewport?.width} x {viewport?.height}
                        </SessionToken>
                    </>
                )}
            </div>
            <SessionShareButton className={styles.shareButton} />
        </div>
    );
};

export default SessionLevelBar;
