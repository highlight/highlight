import React from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { LoadingBar } from '../../../components/Loading/Loading';

import styles from './IntegrationCard.module.scss';

export const IntegrationCard = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    return (
        <>
            <div className={styles.cardWrapper}>
                <div className={styles.card}>
                    <h2>Waiting for Installation...</h2>
                    <p className={styles.text}>
                        Please follow the{' '}
                        <Link to={`/${organization_id}/setup`}>
                            setup instructions
                        </Link>{' '}
                        to install Highlight. It should take less than a minute
                        for us to detect installation.
                    </p>
                    <LoadingBar width={'100%'} />
                </div>
            </div>
        </>
    );
};
