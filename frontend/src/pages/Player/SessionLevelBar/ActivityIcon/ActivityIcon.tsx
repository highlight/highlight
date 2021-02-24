import classNames from 'classnames';
import React, { ReactElement } from 'react';
import styles from './ActivityIcon.module.scss';

interface Props {
    isActive: boolean;
}

function ActivityIcon({ isActive }: Props): ReactElement {
    return (
        <div
            className={classNames(styles.activityIcon, {
                [styles.active]: isActive,
            })}
        ></div>
    );
}

export default ActivityIcon;
