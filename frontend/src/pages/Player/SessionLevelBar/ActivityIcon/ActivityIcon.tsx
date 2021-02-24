import React, { ReactElement } from 'react';
import styles from './ActivityIcon.module.scss';

interface Props {
    isActive: boolean;
}

function ActivityIcon({ isActive }: Props): ReactElement {
    return <div className={styles.activityIcon}></div>;
}

export default ActivityIcon;
