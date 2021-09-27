import JsonViewer from '@components/JsonViewer/JsonViewer';
import { EventType } from '@highlight-run/rrweb';
import { message } from 'antd';
import classNames from 'classnames/bind';
import React, { useState } from 'react';
import { FaBug, FaRegStopCircle } from 'react-icons/fa';
import { BooleanParam, useQueryParam } from 'use-query-params';

import GoToButton from '../../../components/Button/GoToButton';
import InfoTooltip from '../../../components/InfoTooltip/InfoTooltip';
import SvgCursorClickIcon from '../../../static/CursorClickIcon';
import SvgCursorIcon from '../../../static/CursorIcon';
import SvgDimensionsIcon from '../../../static/DimensionsIcon';
import SvgFaceIdIcon from '../../../static/FaceIdIcon';
import { ReactComponent as HoverIcon } from '../../../static/hover.svg';
import SvgLinkIcon from '../../../static/LinkIcon';
import { ReactComponent as ReferrerIcon } from '../../../static/referrer.svg';
import { ReactComponent as ReloadIcon } from '../../../static/reload.svg';
import { ReactComponent as SegmentIcon } from '../../../static/segment.svg';
import { ReactComponent as TabIcon } from '../../../static/tab.svg';
import SvgTargetIcon from '../../../static/TargetIcon';
import { MillisToMinutesAndSeconds } from '../../../util/time';
import { HighlightEvent } from '../HighlightEvent';
import { useReplayerContext } from '../ReplayerContext';
import RightPanelCard from '../RightPanelCard/RightPanelCard';
import { EventTypeDescriptions } from '../Toolbar/TimelineAnnotationsSettings/TimelineAnnotationsSettings';
import { getAnnotationColor } from '../Toolbar/Toolbar';
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
    const { pause } = useReplayerContext();
    const timeSinceStart = e?.timestamp - start;

    return (
        <RightPanelCard
            key={e.identifier}
            className={styles.card}
            selected={isCurrent}
            onClick={() => setSelected(!selected)}
            primaryColor={getAnnotationColor(details.title as any)}
        >
            <div
                className={classNames(styles.streamElement)}
                key={e.identifier}
                id={e.identifier}
            >
                <div className={styles.headerRow}>
                    <div className={styles.iconWrapper}>
                        {getPlayerEventIcon(details.title || '')}
                    </div>
                </div>
                <div
                    className={
                        selected
                            ? styles.eventContentVerbose
                            : styles.eventContent
                    }
                >
                    <p
                        className={classNames(styles.eventText, {
                            [styles.eventTextSelected]: selected,
                        })}
                    >
                        {/* Removes the starting and ending quotes */}
                        {JSON.stringify(details.displayValue)?.replaceAll(
                            /^\"|\"$/g,
                            ''
                        )}
                    </p>
                </div>
                <div className={classNames(styles.eventTime)}>
                    {MillisToMinutesAndSeconds(timeSinceStart)}
                </div>
                {selected && (
                    <>
                        {debug ? (
                            <div
                                onClick={(event) => {
                                    event.stopPropagation();
                                }}
                            >
                                <JsonViewer
                                    name={null}
                                    collapsed
                                    src={e.data}
                                />
                            </div>
                        ) : (
                            <div className={styles.payloadContainer}>
                                <h2 className={styles.payloadTitle}>
                                    {details.title}{' '}
                                    <InfoTooltip
                                        title={
                                            // @ts-ignore
                                            EventTypeDescriptions[
                                                (details.title as unknown) as string
                                            ]
                                        }
                                    />
                                </h2>
                                <StreamElementPayload
                                    payload={
                                        typeof details.payload === 'object'
                                            ? JSON.stringify(details.payload)
                                            : details.payload
                                    }
                                />
                            </div>
                        )}
                        <GoToButton
                            className={styles.goToButton}
                            onClick={(e) => {
                                // Stopping the event from propagating up to the parent button. This is to allow the element to stay opened when the user clicks on the GoToButton. Without this the element would close.
                                e.stopPropagation();
                                // Sets the current event as null. It will be reset as the player continues.
                                onGoToHandler('');
                                pause(timeSinceStart);

                                message.success(
                                    `Changed player time showing you ${
                                        details.title
                                    } at ${MillisToMinutesAndSeconds(
                                        timeSinceStart
                                    )}`
                                );
                            }}
                        />
                    </>
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

export const getPlayerEventIcon = (title: string, debug?: boolean) =>
    title === 'Click' ? (
        <SvgCursorClickIcon className={classNames(styles.tiltedIcon)} />
    ) : title?.includes('Segment') ? (
        <SegmentIcon className={classNames(styles.defaultIcon)} />
    ) : title === 'Navigate' ? (
        <SvgLinkIcon className={classNames(styles.defaultIcon)} />
    ) : title === 'Track' ? (
        <SvgTargetIcon className={classNames(styles.defaultIcon)} />
    ) : title === 'Identify' ? (
        <SvgFaceIdIcon className={classNames(styles.defaultIcon)} />
    ) : title === 'Reload' ? (
        <ReloadIcon className={classNames(styles.defaultIcon)} />
    ) : title === 'Referrer' ? (
        <ReferrerIcon className={classNames(styles.defaultIcon)} />
    ) : title === 'Tab' ? (
        <TabIcon className={classNames(styles.defaultIcon)} />
    ) : title === 'Stop' ? (
        <FaRegStopCircle className={classNames(styles.defaultIcon)} />
    ) : title === 'Viewport' ? (
        <SvgDimensionsIcon className={classNames(styles.defaultIcon)} />
    ) : title === 'Focus' ? (
        <SvgCursorIcon className={classNames(styles.defaultIcon)} />
    ) : debug ? (
        <FaBug className={classNames(styles.defaultIcon)} />
    ) : (
        <HoverIcon className={classNames(styles.tiltedIcon)} />
    );
