import React from 'react';
import styles from './index.module.scss';
import { ReactComponent as ReferrerIcon } from '../../../static/referrer.svg';
import classNames from 'classnames';

const GoToButton = (props: React.HTMLAttributes<HTMLButtonElement>) => {
    return (
        <button
            {...props}
            className={classNames(styles.goToButton, props.className)}
        >
            Goto <ReferrerIcon className={styles.icon} />
        </button>
    );
};

export default GoToButton;
