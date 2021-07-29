import { ReplayerEvents } from '@highlight-run/rrweb';
import { customEvent } from '@highlight-run/rrweb/dist/types';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import { useGetSessionQuery } from '../../../graph/generated/hooks';
import { ReactComponent as LayoutIcon } from '../../../static/layout.svg';
import { ReactComponent as LockIcon } from '../../../static/lock.svg';
import { ReplayerState, useReplayerContext } from '../ReplayerContext';
import ShareButton from '../ShareButton/ShareButton';
import { CurrentUrlBar } from './CurrentUrlBar/CurrentUrlBar';
import PanelDisplayControls from './PanelDisplayControls/PanelDisplayControls';
import styles from './SessionLevelBar.module.scss';
import SessionToken from './SessionToken/SessionToken';
import { findFirstEventOfType } from './utils/utils';

interface Viewport {
    height: number;
    width: number;
}

const SessionLevelBar = () => {
    const { replayer, state, events } = useReplayerContext();
    const [currentUrl, setCurrentUrl] = useState<string | undefined>(undefined);
    const [viewport, setViewport] = useState<Viewport | null>(null);
    const { session_id } = useParams<{ session_id: string }>();

    const { loading: sessionQueryLoading, data } = useGetSessionQuery({
        variables: {
            id: session_id,
        },
    });

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
        !currentUrl ||
        sessionQueryLoading;

    return (
        <div className={styles.sessionLevelBarContainer}>
            {isLoading ? (
                <div className={styles.skeletonContainer}>
                    <Skeleton count={1} width="100%" height="100%" />
                </div>
            ) : (
                <>
                    <CurrentUrlBar url={currentUrl ?? ''} />
                    <SessionToken
                        icon={<LayoutIcon />}
                        tooltipTitle="The user's current viewport size in pixels."
                    >
                        {viewport?.height} x {viewport?.width}
                    </SessionToken>
                    <SessionToken
                        icon={<LockIcon />}
                        tooltipTitle={
                            <>
                                {data?.session?.enable_strict_privacy
                                    ? 'Text and images in this session are obfuscated.'
                                    : 'This session is recording all content on the page.'}{' '}
                                <a
                                    href="https://docs.highlight.run/docs/privacy#overview"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Learn more about Strict Privacy Mode.
                                </a>
                            </>
                        }
                    >
                        {data?.session?.enable_strict_privacy
                            ? 'Privacy on'
                            : 'Privacy off'}
                    </SessionToken>
                    <div className={styles.endContainer}>
                        <PanelDisplayControls />
                        <ShareButton className={styles.shareButton} />
                    </div>
                </>
            )}
        </div>
    );
};

export default SessionLevelBar;
