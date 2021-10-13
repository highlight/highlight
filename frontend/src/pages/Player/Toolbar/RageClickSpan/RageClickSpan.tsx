import GoToButton from '@components/Button/GoToButton';
import KeyValueTable from '@components/KeyValueTable/KeyValueTable';
import Popover from '@components/Popover/Popover';
import SvgAnnotationWarningIcon from '@icons/AnnotationWarningIcon';
import { RageClick, useReplayerContext } from '@pages/Player/ReplayerContext';
import { MillisToMinutesAndSeconds } from '@util/time';
import message from 'antd/lib/message';
import classNames from 'classnames';
import moment from 'moment';
import React, { useState } from 'react';

import styles from './RageClickSpan.module.scss';

interface Props {
    rageClick: RageClick;
}

const RageClickSpan = ({ rageClick }: Props) => {
    const [isHovered, setIsHovered] = useState(false);
    const { pause, replayer } = useReplayerContext();

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
                            {
                                keyDisplayValue: 'Start Time',
                                renderType: 'string',
                                valueDisplayValue: moment(
                                    rageClick.startTimestamp
                                )
                                    .format('h:mm:ss A')
                                    .toString(),
                            },
                        ]}
                    />
                    <div className={styles.goToButtonContainer}>
                        <GoToButton
                            className={styles.goToButton}
                            onClick={() => {
                                if (replayer) {
                                    const newTime = moment(
                                        rageClick.startTimestamp
                                    ).diff(replayer.getMetaData().startTime);

                                    pause(newTime);
                                    message.success(
                                        `Changed player time to where rage click set starts at ${MillisToMinutesAndSeconds(
                                            newTime
                                        )}.`
                                    );
                                }
                            }}
                        />
                    </div>
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
