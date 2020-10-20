import React, { useState } from 'react';
import { mirror, MouseInteractions, EventType } from 'rrweb';
import { elementNode } from 'rrweb-snapshot';
import { Element } from 'react-scroll';
import { ReactComponent as PointerIcon } from '../../../static/pointer-up.svg';
import { ReactComponent as HoverIcon } from '../../../static/hover.svg';
import { ReactComponent as DownIcon } from '../../../static/down.svg';
import { ReactComponent as UpIcon } from '../../../static/up.svg';
import { ReactComponent as SegmentIcon } from '../../../static/segment.svg';
import { ReactComponent as NavigateIcon } from '../../../static/navigate.svg';
import { ReactComponent as ReferrerIcon } from '../../../static/referrer.svg';
import { HighlightEvent } from '../HighlightEvent';
import { MillisToMinutesAndSeconds } from '../../../util/time';
import { mouseInteractionData } from 'rrweb/typings/types';
import { StaticMap } from '../StaticMap/StaticMap';
import styles from './StreamElement.module.css';

export const StreamElement = ({
    e,
    start,
    isCurrent,
    nodeMap,
}: {
    e: HighlightEvent;
    start: number;
    isCurrent: boolean;
    nodeMap: StaticMap;
}) => {
    const [hover, setHover] = useState(false);
    const [selected, setSelected] = useState(false);
    const details = getEventRenderDetails(e, nodeMap);
    let timeSinceStart = e?.timestamp - start;
    return (
        <Element
            name={e.identifier.toString()}
            key={e.identifier.toString()}
            className={styles.eventWrapper}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => setSelected(!selected)}
        >
            <div
                className={styles.streamElement}
                style={{
                    backgroundColor:
                        isCurrent || selected ? '#5629c6' : 'inherit',
                    color: isCurrent || selected ? 'white' : 'grey',
                    fill: isCurrent || selected ? 'white' : 'grey',
                }}
                key={e.identifier}
                id={e.identifier}
            >
                <div className={styles.iconWrapper}>
                    {selected ? (
                        <UpIcon className={styles.directionIcon} />
                    ) : hover ? (
                        <DownIcon className={styles.directionIcon} />
                    ) : details.title === 'Click' ? (
                        <PointerIcon className={styles.tiltedIcon} />
                    ) : details.title === 'Segment' ? (
                        <SegmentIcon className={styles.defaultIcon} />
                    ) : details.title === 'Navigate' ? (
                        <NavigateIcon className={styles.defaultIcon} />
                    ) : details.title === 'Referrer' ? (
                        <ReferrerIcon className={styles.defaultIcon} />
                    ) : (
                        <HoverIcon className={styles.tiltedIcon} />
                    )}
                </div>
                <div
                    className={
                        selected
                            ? styles.eventContentVerbose
                            : styles.eventContent
                    }
                >
                    <div className={styles.eventText}>{details.title}</div>
                    <div
                        className={
                            selected
                                ? styles.codeBlockWrapperVerbose
                                : styles.codeBlockWrapper
                        }
                    >
                        {details.payload}
                    </div>
                </div>
                <div className={styles.eventTime}>
                    {MillisToMinutesAndSeconds(timeSinceStart)}
                </div>
            </div>
        </Element>
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
