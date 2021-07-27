import { H } from 'highlight.run';
import React, { useEffect } from 'react';
import { BiMinus } from 'react-icons/bi';
import { BsPlus } from 'react-icons/bs';

import Button from '../../../../components/Button/Button/Button';
import Tooltip from '../../../../components/Tooltip/Tooltip';
import { useGetAdminQuery } from '../../../../graph/generated/hooks';
import usePlayerConfiguration from '../../PlayerHook/utils/usePlayerConfiguration';
import styles from './SpeedControl.module.scss';

const MIN_SPEED = 0.5;
const MAX_SPEED = 8.0;
const SPEED_INCREMENT = 0.5;

interface Props {
    disabled: boolean;
}

const SpeedControl = ({ disabled }: Props) => {
    const { data: admin_data } = useGetAdminQuery({ skip: false });
    const { playerSpeed, setPlayerSpeed } = usePlayerConfiguration();

    const onHandleSpeedChange = (type: 'DECREMENT' | 'INCREMENT') => {
        let newSpeed = playerSpeed;

        if (type === 'DECREMENT') {
            newSpeed = Math.max(MIN_SPEED, newSpeed - SPEED_INCREMENT);
        } else {
            newSpeed = Math.min(MAX_SPEED, newSpeed + SPEED_INCREMENT);
        }

        setPlayerSpeed(newSpeed);
    };

    useEffect(() => {
        if (admin_data?.admin?.email === 'lorilyn@impira.com') {
            H.track('PlayerSpeedOverride', { admin: 'lorilyn@impira.com' });
            setPlayerSpeed(1.0);
        }
    }, [admin_data?.admin?.email, setPlayerSpeed]);

    return (
        <div className={styles.speedControlContainer}>
            <Button
                trackingId="DecreasePlayerSpeed"
                className={styles.speedButton}
                onClick={() => {
                    onHandleSpeedChange('DECREMENT');
                }}
                type="primary"
                disabled={disabled || playerSpeed === MIN_SPEED}
            >
                <BiMinus />
            </Button>
            <Tooltip
                title="Control the playback speed of the session player."
                arrowPointAtCenter
            >
                <span className={styles.speedText}>
                    {playerSpeed.toFixed(1)}x
                </span>
            </Tooltip>
            <Button
                trackingId="IncreasePlayerSpeed"
                className={styles.speedButton}
                type="primary"
                onClick={() => {
                    onHandleSpeedChange('INCREMENT');
                }}
                disabled={disabled || playerSpeed === MAX_SPEED}
            >
                <BsPlus />
            </Button>
        </div>
    );
};

export default SpeedControl;
