import React, { useEffect } from 'react';

import Button from '../../../../../../components/Button/Button/Button';
import ElevatedCard from '../../../../../../components/ElevatedCard/ElevatedCard';
import SvgSearchIcon from '../../../../../../static/SearchIcon';
import { useErrorPageUIContext } from '../../../../context/ErrorPageUIContext';
import useErrorPageConfiguration from '../../../../utils/ErrorPageUIConfiguration';
import styles from './NoActiveErrorCard.module.scss';

const NoActiveErrorCard = () => {
    const { setShowLeftPanel } = useErrorPageConfiguration();
    const { searchBarRef } = useErrorPageUIContext();

    useEffect(() => {
        setShowLeftPanel(true);
    }, [setShowLeftPanel]);

    return (
        <ElevatedCard
            className={styles.card}
            title="Let's squash some bugs!"
            actions={
                <Button
                    trackingId="NoActiveErrorCardPerformASearch"
                    type="primary"
                    className={styles.buttonWrapper}
                    onClick={() => {
                        if (searchBarRef) {
                            searchBarRef.focus();
                        }
                    }}
                >
                    <SvgSearchIcon />
                    Perform a Search
                </Button>
            }
        >
            <p>
                View a recent error or find a specific error message, URL, or
                segment.
            </p>
        </ElevatedCard>
    );
};

export default NoActiveErrorCard;
