import React from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Spinner } from '../../../components/Spinner/Spinner';

import styles from './IntegrationCard.module.scss';

export const IntegrationCard = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    return (
        <>
            <div className={styles.cardWrapper}>
                <div className={styles.card}>
                    <div className={styles.title}>
                        Waiting for Installation...
                    </div>
                    <div className={styles.text}>
                        Please follow the{' '}
                        <Link to={`/${organization_id}/setup`}>
                            setup instructions
                        </Link>{' '}
                        to install Highlight. It should take less than a minute
                        for us to detect installation.
                    </div>
                    <Spinner width={'100%'} />
                </div>
            </div>
        </>
    );
};
