import React, { useEffect } from 'react';

import ElevatedCard from '../../../../../../components/ElevatedCard/ElevatedCard';
import useErrorPageConfiguration from '../../../../utils/ErrorPageUIConfiguration';
import styles from './NoActiveErrorCard.module.scss';

const NoActiveErrorCard = () => {
    const { setShowLeftPanel } = useErrorPageConfiguration();

    useEffect(() => {
        setShowLeftPanel(true);
    }, [setShowLeftPanel]);

    return (
        <ElevatedCard className={styles.card} title="Let's squash some bugs!">
            <p>
                View a recent error or find a specific error message, URL, or
                segment.
            </p>
        </ElevatedCard>
    );
};

export default NoActiveErrorCard;
