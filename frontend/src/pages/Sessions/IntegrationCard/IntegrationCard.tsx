import DemoWorkspaceButton from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { useParams } from '@util/react-router/useParams';
import Lottie from 'lottie-react';
import React from 'react';
import { Link } from 'react-router-dom';

import FullBleedCard from '../../../components/FullBleedCard/FullBleedCard';
import WaitingAnimation from '../../../lottie/waiting.json';
import styles from './IntegrationCard.module.scss';

export const IntegrationCard = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    return (
        <FullBleedCard
            title="Waiting for Installation..."
            animation={<Lottie animationData={WaitingAnimation} />}
        >
            <p>
                Please follow the{' '}
                <Link to={`/${organization_id}/setup`}>setup instructions</Link>{' '}
                to install Highlight. It should take less than a minute for us
                to detect installation.
            </p>
            <div className={styles.demoWorkspaceButton}>
                <DemoWorkspaceButton integrated={false} />
            </div>
        </FullBleedCard>
    );
};
