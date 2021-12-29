import DashboardCard from '@pages/Dashboards/components/DashboardCard/DashboardCard';
import { useDashboardsContext } from '@pages/Dashboards/DashboardsContext/DashboardsContext';
import { useParams } from '@util/react-router/useParams';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import styles from './DashboardPage.module.scss';

const SUPPORTED_WEB_VITALS = ['CLS', 'FCP', 'FID', 'LCP', 'TTFB'] as const;

const DashboardPage = () => {
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const { dashboards } = useDashboardsContext();

    useEffect(() => {
        const dashboard = dashboards.find((d) => d.id === parseInt(id, 10));
        const name = dashboard?.name || '';

        history.replace({ state: { dashboardName: name } });
    }, [dashboards, history, id]);

    return (
        <div className={styles.grid}>
            {SUPPORTED_WEB_VITALS.map((webVital) => (
                <DashboardCard webVitalName={webVital} key={webVital} />
            ))}
        </div>
    );
};

export default DashboardPage;
