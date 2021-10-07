import KeyValueTable from '@components/KeyValueTable/KeyValueTable';
import Popover from '@components/Popover/Popover';
import SvgAnnotationWarningIcon from '@icons/AnnotationWarningIcon';
import { RageClick } from '@pages/Player/ReplayerContext';
import classNames from 'classnames';
import moment from 'moment';
import React, { useState } from 'react';

import styles from './RageClickSpan.module.scss';

interface Props {
    rageClick: RageClick;
}

const RageClickSpan = ({ rageClick }: Props) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Popover
            placement="top"
            onMouseEnter={() => {
                setIsHovered(true);
            }}
            onMouseLeave={() => {
                setIsHovered(false);
            }}
            content={
                <div className={styles.popoverContent}>
                    <KeyValueTable
                        tableClassName={styles.table}
                        data={[
                            {
                                keyDisplayValue: 'Clicks of Rage',
                                renderType: 'string',
                                valueDisplayValue: `${rageClick.totalClicks}`,
                            },
                            {
                                keyDisplayValue: 'Duration',
                                renderType: 'string',
                                valueDisplayValue: `${moment(
                                    rageClick.endTimestamp
                                ).diff(
                                    moment(rageClick.startTimestamp),
                                    'seconds'
                                )} seconds`,
                            },
                        ]}
                    />
                </div>
            }
            align={{ offset: [0, -24] }}
            title={
                <span className={styles.title}>
                    <span className={styles.iconContainer}>
                        <SvgAnnotationWarningIcon />
                    </span>
                    Rage Click
                </span>
            }
        >
            <div
                className={classNames(styles.rageClick, {
                    [styles.hover]: isHovered,
                })}
                style={{
                    left: `${rageClick.startPercentage * 100}%`,
                    width: `${
                        (rageClick.endPercentage - rageClick.startPercentage) *
                        100
                    }%`,
                }}
            >
                <div className={styles.icon}>
                    <SvgAnnotationWarningIcon />
                </div>
            </div>
        </Popover>
    );
};

export default RageClickSpan;
