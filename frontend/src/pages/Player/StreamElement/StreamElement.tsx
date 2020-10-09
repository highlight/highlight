import React, { useState } from 'react';
import { mirror, MouseInteractions, EventType } from 'rrweb';
import { elementNode } from 'rrweb-snapshot';
import { Element } from 'react-scroll';
import { ReactComponent as PointerIcon } from '../../../static/pointer-up.svg';
import { ReactComponent as HoverIcon } from '../../../static/hover.svg';
import { ReactComponent as DownIcon } from '../../../static/down.svg';
import { ReactComponent as UpIcon } from '../../../static/up.svg';
import { ReactComponent as SegmentIcon } from '../../../static/segment.svg';
import { HighlightEvent } from '../HighlightEvent';
import { MillisToMinutesAndSeconds } from '../../../util/time';
import { mouseInteractionData } from 'rrweb/typings/types';
import styles from './StreamElement.module.css';

export const StreamElement = ({
    e,
    start,
    isCurrent,
}: {
    e: HighlightEvent;
    start: number;
    isCurrent: boolean;
}) => {
    const [hover, setHover] = useState(false);
    const [selected, setSelected] = useState(false);
    const details = getEventRenderDetails(e);
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
                        <UpIcon className={styles.upIcon} />
                    ) : hover ? (
                        <DownIcon className={styles.downIcon} />
                    ) : details.title === 'Click' ? (
                        <PointerIcon className={styles.eventIcon} />
                    ) : details.title === 'Segment' ? (
                        <SegmentIcon className={styles.eventIcon} />
                    ) : (
                        <HoverIcon className={styles.eventIcon} />
                    )}
                </div>
                <div
                    className={
                        selected
                            ? styles.eventContentVerbose
                            : styles.eventContent
                    }
                >
                    <div className={styles.eventText}>
                        &nbsp;{details.title} &nbsp;&nbsp;
                    </div>
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

const getEventRenderDetails = (e: HighlightEvent): EventRenderDetails => {
    var details: EventRenderDetails = {};
    if (e.type === EventType.Custom) {
        details.title = 'Segment';
        const payload: any = e.data.payload;
        details.payload = JSON.stringify(payload.properties);
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
        const node = mirror.map[mouseInteraction.id]?.__sn as elementNode;
        var idString = node?.tagName;
        if (node?.attributes) {
            const attrs = node?.attributes;
            if ('class' in attrs && attrs.class.toString()) {
                idString = idString.concat('.' + attrs.class);
            }
            if ('id' in attrs && attrs.id.toString()) {
                idString = idString.concat('#' + attrs.id);
            }
            Object.keys(attrs)
                .filter((key) => !['class', 'id'].includes(key))
                .forEach(
                    (key) => (idString += '[' + key + '=' + attrs[key] + ']')
                );
        }
        details.title = eventStr;
        details.payload = idString;
    }
    return details;
};
