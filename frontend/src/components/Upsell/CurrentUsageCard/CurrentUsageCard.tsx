import { Progress } from 'antd';
import React from 'react';
import styles from './CurrentUsageCard.module.scss';

export interface CurrentUsageCardProps {
    limit: number;
    currentUsage: number;
}

export const CurrentUsageCard: React.FC<CurrentUsageCardProps> = ({
    currentUsage,
    limit,
}) => {
    return (
        <section className={styles.container}>
            <h3 className={styles.header}>Upgrade to increase your limit!</h3>
            <p className={styles.description}>
                This workspace has used {currentUsage} of its {limit} sessions
                limit ({((currentUsage / limit) * 100).toFixed(0)}%).
            </p>
            <Progress
                percent={Math.floor((currentUsage / limit) * 100)}
                showInfo={false}
                strokeColor="#5629c6"
            />
        </section>
    );
};
