import Lottie from 'lottie-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import Card from '../../../components/Card/Card';
import WaitingAnimation from '../../../lottie/waiting.json';
import styles from './IntegrationCard.module.scss';

export const IntegrationCard = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    return (
        <div className={styles.cardContainer}>
            <Card
                title="Waiting for Installation..."
                animation={<Lottie animationData={WaitingAnimation} />}
            >
                <p>
                    Please follow the{' '}
                    <Link to={`/${organization_id}/setup`}>
                        setup instructions
                    </Link>{' '}
                    to install Highlight. It should take less than a minute for
                    us to detect installation.
                </p>
            </Card>
        </div>
    );
};
