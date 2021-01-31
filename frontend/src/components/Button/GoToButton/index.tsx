import React from 'react';
import styles from './index.module.scss';
import { ReactComponent as ReferrerIcon } from '../../../static/referrer.svg';

const GoToButton = (props: React.HTMLAttributes<HTMLButtonElement>) => {
    return (
        <button {...props} className={styles.goToButton}>
            Goto <ReferrerIcon className={styles.icon} />
        </button>
    );
};

export default GoToButton;
