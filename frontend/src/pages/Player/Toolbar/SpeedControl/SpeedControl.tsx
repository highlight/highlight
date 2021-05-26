import useLocalStorage from '@rehooks/local-storage';
import { H } from 'highlight.run';
import React, { useEffect } from 'react';
import { BiMinus } from 'react-icons/bi';
import { BsPlus } from 'react-icons/bs';

import Button from '../../../../components/Button/Button/Button';
import Tooltip from '../../../../components/Tooltip/Tooltip';
import { useGetAdminQuery } from '../../../../graph/generated/hooks';
import styles from './SpeedControl.module.scss';

const MIN_SPEED = 0.5;
const MAX_SPEED = 8.0;
const SPEED_INCREMENT = 0.5;
const DEFAULT_SPEED = 2.0;

interface Props {
    disabled: boolean;
}

const SpeedControl = ({ disabled }: Props) => {
    const { data: admin_data } = useGetAdminQuery({ skip: false });
    const [speed, setSpeed] = useLocalStorage(
        'highlightMenuSpeed',
        DEFAULT_SPEED
    );

    const onHandleSpeedChange = (type: 'DECREMENT' | 'INCREMENT') => {
        let newSpeed = speed;

        if (type === 'DECREMENT') {
            newSpeed = Math.max(MIN_SPEED, newSpeed - SPEED_INCREMENT);
        } else {
            newSpeed = Math.min(MAX_SPEED, newSpeed + SPEED_INCREMENT);
        }

        setSpeed(newSpeed);
    };

    useEffect(() => {
        if (admin_data?.admin?.email === 'lorilyn@impira.com') {
            H.track('PlayerSpeedOverride', { admin: 'lorilyn@impira.com' });
            setSpeed(1.0);
        }
    }, [admin_data?.admin?.email, setSpeed]);

    return (
        <div className={styles.speedControlContainer}>
            <Button
                className={styles.speedButton}
                onClick={() => {
                    onHandleSpeedChange('DECREMENT');
                }}
                disabled={disabled || speed === MIN_SPEED}
            >
                <BiMinus />
            </Button>
            <Tooltip
                title="Control the playback speed of the session player."
                arrowPointAtCenter
            >
                <span className={styles.speedText}>{speed.toFixed(1)}x</span>
            </Tooltip>
            <Button
                className={styles.speedButton}
                onClick={() => {
                    onHandleSpeedChange('INCREMENT');
                }}
                disabled={disabled || speed === MAX_SPEED}
            >
                <BsPlus />
            </Button>
        </div>
    );
};

export default SpeedControl;
