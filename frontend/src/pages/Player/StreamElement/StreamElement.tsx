import { EventType } from '@highlight-run/rrweb';
import classNames from 'classnames/bind';
import React, { useContext, useState } from 'react';
import { FaBug, FaRegStopCircle } from 'react-icons/fa';
import ReactJson from 'react-json-view';
import { BooleanParam, useQueryParam } from 'use-query-params';

import GoToButton from '../../../components/Button/GoToButton';
import { ReactComponent as DownIcon } from '../../../static/chevron-down-icon.svg';
import { ReactComponent as HoverIcon } from '../../../static/hover.svg';
import { ReactComponent as IdentifyIcon } from '../../../static/identify.svg';
import { ReactComponent as NavigateIcon } from '../../../static/navigate.svg';
import { ReactComponent as PointerIcon } from '../../../static/pointer-up.svg';
import { ReactComponent as ReferrerIcon } from '../../../static/referrer.svg';
import { ReactComponent as ReloadIcon } from '../../../static/reload.svg';
import { ReactComponent as SegmentIcon } from '../../../static/segment.svg';
import { ReactComponent as TabIcon } from '../../../static/tab.svg';
import { ReactComponent as TrackIcon } from '../../../static/track.svg';
import { MillisToMinutesAndSeconds } from '../../../util/time';
import { HighlightEvent } from '../HighlightEvent';
import ReplayerContext from '../ReplayerContext';
import RightPanelCard from '../RightPanelCard/RightPanelCard';
import styles from './StreamElement.module.scss';
import StreamElementPayload from './StreamElementPayload';

export const StreamElement = ({
    e,
    start,
    isCurrent,
    onGoToHandler,
}: {
    e: HighlightEvent;
    start: number;
    isCurrent: boolean;
    onGoToHandler: (event: string) => void;
}) => {
    const [debug] = useQueryParam('debug', BooleanParam);
    const [selected, setSelected] = useState(false);
    const details = getEventRenderDetails(e);
    const { pause } = useContext(ReplayerContext);
    const timeSinceStart = e?.timestamp - start;

    return (
        <RightPanelCard
            //     id={e.identifier}
            key={e.identifier}
            className={styles.card}
            selected={isCurrent}
            onClick={() => setSelected(!selected)}
        >
            <div
                className={classNames(styles.streamElement, {
                    [styles.currentStreamElement]: isCurrent,
                })}
                key={e.identifier}
                id={e.identifier}
            >
                <div className={styles.headerRow}>
                    <div className={styles.iconWrapper}>
                        {selected ? (
                            <DownIcon
                                className={classNames(styles.directionIcon, {
                                    [styles.selectedIcon]: selected,
                                })}
                            />
                        ) : details.title === 'Click' ? (
                            <PointerIcon
                                className={classNames(styles.tiltedIcon)}
                            />
                        ) : details.title?.includes('Segment') ? (
                            <SegmentIcon
                                className={classNames(styles.defaultIcon)}
                            />
                        ) : details.title === 'Navigate' ? (
                            <NavigateIcon
                                className={classNames(styles.defaultIcon)}
                            />
                        ) : details.title === 'Track' ? (
                            <TrackIcon
                                className={classNames(styles.defaultIcon)}
                            />
                        ) : details.title === 'Identify' ? (
                            <IdentifyIcon
                                className={classNames(styles.defaultIcon)}
                            />
                        ) : details.title === 'Reload' ? (
                            <ReloadIcon
                                className={classNames(styles.defaultIcon)}
                            />
                        ) : details.title === 'Referrer' ? (
                            <ReferrerIcon
                                className={classNames(styles.defaultIcon)}
                            />
                        ) : details.title === 'Tab' ? (
                            <TabIcon
                                className={classNames(styles.defaultIcon)}
                            />
                        ) : details.title === 'Stop' ? (
                            <FaRegStopCircle
                                className={classNames(styles.defaultIcon)}
                            />
                        ) : debug ? (
                            <FaBug className={classNames(styles.defaultIcon)} />
                        ) : (
                            <HoverIcon
                                className={classNames(styles.tiltedIcon)}
                            />
                        )}
                    </div>
                </div>
                <div
                    className={
                        selected
                            ? styles.eventContentVerbose
                            : styles.eventContent
                    }
                >
                    {!selected && (
                        <p className={styles.eventText}>
                            {/* Removes the starting and ending quotes */}
                            {JSON.stringify(details.displayValue)?.replaceAll(
                                /^\"|\"$/g,
                                ''
                            )}
                        </p>
                    )}
                </div>
                {selected ? (
                    <>
                        {debug ? (
                            <div
                                onClick={(event) => {
                                    event.stopPropagation();
                                }}
                            >
                                <ReactJson
                                    style={{ wordBreak: 'break-word' }}
                                    name={null}
                                    collapsed
                                    src={e.data}
                                    iconStyle="circle"
                                />
                            </div>
                        ) : (
                            <StreamElementPayload
                                payload={
                                    typeof details.payload === 'object'
                                        ? JSON.stringify(details.payload)
                                        : details.payload
                                }
                            />
                        )}
                        <GoToButton
                            className={styles.goToButton}
                            onClick={(e) => {
                                // Stopping the event from propagating up to the parent button. This is to allow the element to stay opened when the user clicks on the GoToButton. Without this the element would close.
                                e.stopPropagation();
                                // Sets the current event as null. It will be reset as the player continues.
                                onGoToHandler('');
                                pause(timeSinceStart);
                            }}
                        />
                        <div
                            className={classNames(
                                styles.eventTime,
                                styles.relativeTimeExpanded
                            )}
                        >
                            {MillisToMinutesAndSeconds(timeSinceStart)}
                        </div>
                    </>
                ) : (
                    <div className={styles.eventTime}>
                        {MillisToMinutesAndSeconds(timeSinceStart)}
                    </div>
                )}
            </div>
        </RightPanelCard>
    );
};

type EventRenderDetails = {
    title?: string;
    payload?: string;
    displayValue: string;
};

export const getEventRenderDetails = (
    e: HighlightEvent
): EventRenderDetails => {
    const details: EventRenderDetails = {
        displayValue: '',
    };
    if (e.type === EventType.Custom) {
        const payload = e.data.payload as any;

        details.title = e.data.tag;
        switch (e.data.tag) {
            case 'Identify':
                details.displayValue = JSON.parse(payload).user_identifier;
                break;
            case 'Track':
                details.displayValue = e.identifier;
                break;
            case 'Viewport':
                details.displayValue = `${payload.height} x ${payload.width}`;
                break;
            case 'Navigate':
            case 'Click':
            case 'Focus':
            case 'Segment':
                details.displayValue = payload;
                break;
            default:
                details.displayValue = payload;
                break;
        }
        details.payload = e.data.payload as string;
    }

    return details;
};
