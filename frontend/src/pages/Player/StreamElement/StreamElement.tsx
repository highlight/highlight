import React, { useContext, useState } from 'react';
import { MouseInteractions, EventType } from '@highlight-run/rrweb';
import { ReactComponent as PointerIcon } from '../../../static/pointer-up.svg';
import { ReactComponent as HoverIcon } from '../../../static/hover.svg';
import { ReactComponent as DownIcon } from '../../../static/chevron-down.svg';
import { ReactComponent as SegmentIcon } from '../../../static/segment.svg';
import { ReactComponent as NavigateIcon } from '../../../static/navigate.svg';
import { ReactComponent as ReloadIcon } from '../../../static/reload.svg';
import { ReactComponent as ReferrerIcon } from '../../../static/referrer.svg';
import { HighlightEvent } from '../HighlightEvent';
import { MillisToMinutesAndSeconds } from '../../../util/time';
import { mouseInteractionData } from '@highlight-run/rrweb/typings/types';
import { StaticMap } from '../StaticMap/StaticMap';
import styles from './StreamElement.module.scss';
import GoToButton from '../../../components/Button/GoToButton';
import ReplayerContext from '../ReplayerContext';
import StreamElementPayload from './StreamElementPayload';
import classNames from 'classnames';

export const StreamElement = ({
    e,
    start,
    isCurrent,
    nodeMap,
    onGoToHandler,
}: {
    e: HighlightEvent;
    start: number;
    isCurrent: boolean;
    nodeMap: StaticMap;
    onGoToHandler: (event: string) => void;
}) => {
    const [hover, setHover] = useState(false);
    const [selected, setSelected] = useState(false);
    const details = getEventRenderDetails(e, nodeMap);
    const { pause } = useContext(ReplayerContext);
    let timeSinceStart = e?.timestamp - start;
    return (
        <div
            className={styles.eventWrapper}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => setSelected(!selected)}
            id={e.identifier}
            key={e.identifier}
        >
            <div
                className={classNames(styles.streamElement, {
                    [styles.currentStreamElement]: isCurrent,
                    [styles.selectedStreamElement]: selected,
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
                                    [styles.currentIcon]: isCurrent,
                                })}
                            />
                        ) : hover ? (
                            <DownIcon className={styles.directionIcon} />
                        ) : details.title === 'Click' ? (
                            <PointerIcon className={styles.tiltedIcon} />
                        ) : details.title === 'Segment' ? (
                            <SegmentIcon className={styles.defaultIcon} />
                        ) : details.title === 'Navigate' ? (
                            <NavigateIcon className={styles.defaultIcon} />
                        ) : details.title === 'Reload' ? (
                            <ReloadIcon className={styles.defaultIcon} />
                        ) : details.title === 'Referrer' ? (
                            <ReferrerIcon className={styles.defaultIcon} />
                        ) : details.title === 'Tab' ? (
                            <ReferrerIcon className={styles.defaultIcon} />
                        ) : (
                            <HoverIcon className={styles.tiltedIcon} />
                        )}
                    </div>
                    <div
                        className={classNames(styles.eventText, {
                            [styles.selectedEventText]: selected,
                            [styles.currentEventText]: isCurrent,
                        })}
                    >
                        {details.title}
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
                            <StreamElementPayload payload={details.payload} />
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

const getEventRenderDetails = (
    e: HighlightEvent,
    nodeMap: StaticMap
): EventRenderDetails => {
    var details: EventRenderDetails = {};
    if (e.type === EventType.Custom) {
        details.title = e.data.tag;
        const payload: any = e.data.payload;
        details.payload = payload;
    } else if (e.type === EventType.IncrementalSnapshot) {
        const mouseInteraction = e.data as mouseInteractionData;
        let eventStr = '';
        switch (mouseInteraction.type) {
            case MouseInteractions.Click:
                eventStr = 'Click';
                break;
            case MouseInteractions.Focus:
                eventStr = 'Focus';
                break;
        }
        if (nodeMap[mouseInteraction.id] && nodeMap[mouseInteraction.id][0]) {
            const node = nodeMap[mouseInteraction.id][0].node;
            var idString = nodeMap[mouseInteraction.id][0].node.tagName;
            if (node?.attributes) {
                const attrs = node?.attributes;
                if ('class' in attrs && attrs?.class?.toString()) {
                    idString = idString.concat('.' + attrs.class);
                }
                if ('id' in attrs && attrs?.id?.toString()) {
                    idString = idString.concat('#' + attrs.id);
                }
                Object.keys(attrs)
                    .filter((key) => !['class', 'id'].includes(key))
                    .forEach(
                        (key) =>
                            (idString += '[' + key + '=' + attrs[key] + ']')
                    );
            }
            details.payload = idString;
        }

        details.title = eventStr;
    }
    return details;
};
