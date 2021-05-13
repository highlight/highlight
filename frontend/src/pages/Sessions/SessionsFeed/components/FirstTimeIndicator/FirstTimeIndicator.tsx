import React from 'react';

import Tooltip from '../../../../../components/Tooltip/Tooltip';
import styles from './FirstTimeIndicator.module.scss';

interface Props {
    userIdentifier: string;
}

const FirstTimeIndicator = ({ userIdentifier }: Props) => {
    return (
        <Tooltip
            title={`This is the first time ${userIdentifier} has had a session recorded.`}
        >
            <div className={styles.container}>
                <span>New User</span>
            </div>
        </Tooltip>
    );
};

export default FirstTimeIndicator;
