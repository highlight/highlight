import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Progress from '../../Progress/Progress';
import styles from './CurrentUsageCard.module.scss';

export interface CurrentUsageCardProps {
    limit: number;
    currentUsage: number;
}

export const CurrentUsageCard: React.FC<CurrentUsageCardProps> = ({
    currentUsage,
    limit,
}) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    return (
        <section className={styles.container}>
            <h3 className={styles.header}>
                <Link to={`/${organization_id}/billing`}>Upgrade </Link>to
                increase your limit!
            </h3>
            <p className={styles.description}>
                This workspace has used {currentUsage} of its {limit} monthly
                sessions limit ({((currentUsage / limit) * 100).toFixed(0)}%).
            </p>
            <Progress
                numerator={currentUsage}
                denominator={limit}
                showInfo={false}
            />
        </section>
    );
};
