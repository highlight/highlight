import React, { useContext, useState } from 'react';
import { EventType } from '@highlight-run/rrweb';
import { ReactComponent as PointerIcon } from '../../../static/pointer-up.svg';
import { ReactComponent as HoverIcon } from '../../../static/hover.svg';
import { ReactComponent as DownIcon } from '../../../static/chevron-down.svg';
import { ReactComponent as SegmentIcon } from '../../../static/segment.svg';
import { ReactComponent as NavigateIcon } from '../../../static/navigate.svg';
import { ReactComponent as ReloadIcon } from '../../../static/reload.svg';
import { ReactComponent as ReferrerIcon } from '../../../static/referrer.svg';
import { ReactComponent as IdentifyIcon } from '../../../static/identify.svg';
import { ReactComponent as TrackIcon } from '../../../static/track.svg';
import { ReactComponent as TabIcon } from '../../../static/tab.svg';
import { HighlightEvent } from '../HighlightEvent';
import { MillisToMinutesAndSeconds } from '../../../util/time';
import styles from './StreamElement.module.scss';
import GoToButton from '../../../components/Button/GoToButton';
import ReplayerContext from '../ReplayerContext';
import StreamElementPayload from './StreamElementPayload';
import classNames from 'classnames/bind';
import { BooleanParam, useQueryParam } from 'use-query-params';
import ReactJson from 'react-json-view';

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
    const [hover, setHover] = useState(false);
    const [selected, setSelected] = useState(false);
    const details = getEventRenderDetails(e);
    const { pause } = useContext(ReplayerContext);
    const timeSinceStart = e?.timestamp - start;

    return (
        <div
            className={styles.eventWrapper}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            id={e.identifier}
            key={e.identifier}
        >
            <div
                className={classNames(styles.streamElement, {
                    [styles.currentStreamElement]: isCurrent,
                    [styles.selectedStreamElement]: selected,
                })}
                style={{
                    backgroundColor: hover && !selected ? '#efefef7d' : 'white',
                }}
                key={e.identifier}
                id={e.identifier}
                onClick={() => setSelected(!selected)}
            >
                <div className={styles.headerRow}>
                    <div className={styles.iconWrapper}>
                        {selected ? (
                            <DownIcon
                                className={classNames(styles.directionIcon, {
                                    [styles.selectedIcon]: selected,
                                    [styles.currentIcon]: isCurrent,
                                })}
                            />
                        ) : details.title === 'Click' ? (
                            <PointerIcon
                                className={classNames(styles.tiltedIcon, {
                                    [styles.currentIcon]: isCurrent,
                                })}
                            />
                        ) : details.title?.includes('Segment') ? (
                            <SegmentIcon
                                className={classNames(styles.defaultIcon, {
                                    [styles.currentIcon]: isCurrent,
                                })}
                            />
                        ) : details.title === 'Navigate' ? (
                            <NavigateIcon
                                className={classNames(styles.defaultIcon, {
                                    [styles.currentIcon]: isCurrent,
                                })}
                            />
                        ) : details.title === 'Track' ? (
                            <TrackIcon
                                className={classNames(styles.defaultIcon, {
                                    [styles.currentIcon]: isCurrent,
                                })}
                            />
                        ) : details.title === 'Identify' ? (
                            <IdentifyIcon
                                className={classNames(styles.defaultIcon, {
                                    [styles.currentIcon]: isCurrent,
                                })}
                            />
                        ) : details.title === 'Reload' ? (
                            <ReloadIcon
                                className={classNames(styles.defaultIcon, {
                                    [styles.currentIcon]: isCurrent,
                                })}
                            />
                        ) : details.title === 'Referrer' ? (
                            <ReferrerIcon
                                className={classNames(styles.defaultIcon, {
                                    [styles.currentIcon]: isCurrent,
                                })}
                            />
                        ) : details.title === 'Tab' ? (
                            <TabIcon
                                className={classNames(styles.defaultIcon, {
                                    [styles.currentIcon]: isCurrent,
                                })}
                            />
                        ) : (
                            <HoverIcon
                                className={classNames(styles.tiltedIcon, {
                                    [styles.currentIcon]: isCurrent,
                                })}
                            />
                        )}
                    </div>
                    <div
                        className={classNames(styles.eventText, {
                            [styles.selectedEventText]: selected,
                            [styles.currentEventText]: isCurrent,
                        })}
                    >
                        {details.title ? details.title : debug ? e.type : ''}
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
                        <div
                            className={
                                selected
                                    ? styles.codeBlockWrapperVerbose
                                    : styles.codeBlockWrapper
                            }
                        >
                            <span className={styles.codeBlock}>
                                {JSON.stringify(details.payload)}
                            </span>
                        </div>
                    )}
                </div>
                {selected ? (
                    <>
                        <div className={styles.codeBlockWrapperVerbose}>
                            {debug ? (
                                <ReactJson
                                    style={{ wordBreak: 'break-word' }}
                                    name={null}
                                    collapsed
                                    src={e.data}
                                    iconStyle="circle"
                                />
                            ) : (
                                <StreamElementPayload
                                    payload={
                                        typeof details.payload === 'object'
                                            ? JSON.stringify(details.payload)
                                            : details.payload
                                    }
                                />
                            )}
                        </div>
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
        </div>
    );
};

type EventRenderDetails = {
    title?: string;
    payload?: string;
};

const getEventRenderDetails = (e: HighlightEvent): EventRenderDetails => {
    const details: EventRenderDetails = {};
    if (e.type === EventType.Custom) {
        details.title = e.data.tag;
        const payload: any = e.data.payload;
        details.payload = payload;
    }

    return details;
};
