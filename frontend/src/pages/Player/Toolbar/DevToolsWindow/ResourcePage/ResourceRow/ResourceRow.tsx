import React, { useState, useContext } from 'react';
import { scroller, Element } from 'react-scroll';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Tooltip } from 'antd';
import { Modal, message } from 'antd';
import { ReactComponent as Close } from '../../../../../../static/close.svg';
import { ExpandedResourceContext } from '../ResourceContentsContext/ResourceContentsContext';

import styles from './ResourceRow.module.css';
import { NetworkResourceTiming } from '../../../../../../util/shared-types';

export const ResourceRow = ({
    current,
    resource,
    range,
}: {
    current: boolean;
    resource: NetworkResourceTiming & { id: number };
    range: number;
}) => {
    const [selected, setSelected] = useState(false);
    const leftPaddingPercent = (resource.startTime / range) * 100;
    const { setExpandedResource } = useContext(ExpandedResourceContext);
    const actualPercent = Math.max(
        ((resource.responseEnd - resource.startTime) / range) * 100,
        0.1
    );
    const rightPaddingPercent = 100 - actualPercent - leftPaddingPercent;
    return (
        <div
            style={{
                color: current ? 'black' : '#808080',
                fontWeight: current ? 400 : 300,
            }}
            className={styles.networkRow}
            onClick={() => {
                setExpandedResource(resource);
            }}
        >
            <div className={styles.typeSection}>{resource.initiatorType}</div>
            <Tooltip title={resource.name}>
                <div className={styles.nameSection}>{resource.name}</div>
            </Tooltip>
            <div>{(resource.responseEnd - resource.startTime).toFixed(2)}</div>
            <div className={styles.timingBarWrapper}>
                <div
                    style={{
                        width: `${leftPaddingPercent}%`,
                    }}
                    className={styles.timingBarEmptySection}
                />
                <div
                    className={styles.timingBar}
                    style={{
                        width: `${actualPercent}%`,
                    }}
                />
                <div
                    style={{
                        width: `${rightPaddingPercent}%`,
                    }}
                    className={styles.timingBarEmptySection}
                />
            </div>
        </div>
    );
};
