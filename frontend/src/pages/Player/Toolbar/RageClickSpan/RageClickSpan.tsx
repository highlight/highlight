import Popover from '@components/Popover/Popover';
import SvgAnnotationWarningIcon from '@icons/AnnotationWarningIcon';
import { RageClick } from '@pages/Player/ReplayerContext';
import React from 'react';

import styles from './RageClickSpan.module.scss';

interface Props {
    rageClick: RageClick;
}

const RageClickSpan = ({ rageClick }: Props) => {
    return (
        <div
            className={styles.rageClick}
            style={{
                left: `${rageClick.startPercentage * 100}%`,
                width: `${
                    (rageClick.endPercentage - rageClick.startPercentage) * 100
                }%`,
            }}
        >
            <Popover content={<>Clicks of Rage: {rageClick.totalClicks}</>}>
                <div className={styles.icon}>
                    <SvgAnnotationWarningIcon />
                </div>
            </Popover>
        </div>
    );
};

export default RageClickSpan;
