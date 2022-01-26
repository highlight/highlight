import { StandardDropdown } from '@components/Dropdown/StandardDropdown/StandardDropdown';
import DashboardCard from '@pages/Dashboards/components/DashboardCard/DashboardCard';
import { useDashboardsContext } from '@pages/Dashboards/DashboardsContext/DashboardsContext';
import { useParams } from '@util/react-router/useParams';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import styles from './DashboardPage.module.scss';

const SUPPORTED_WEB_VITALS = ['CLS', 'FCP', 'FID', 'LCP', 'TTFB'] as const;

const timeFilter = [
    { label: 'Last 24 hours', value: 2 },
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
    { label: 'This year', value: 30 * 12 },
] as const;

const DashboardPage = () => {
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const { dashboards } = useDashboardsContext();
    const [dateRangeLength, setDateRangeLength] = useState<number>(
        timeFilter[2].value
    );

    useEffect(() => {
        const dashboard = dashboards.find((d) => d.id === parseInt(id, 10));
        const name = dashboard?.name || '';

        history.replace({ state: { dashboardName: name } });
    }, [dashboards, history, id]);

    return (
        <>
            <div className={styles.dateRangePickerContainer}>
                <StandardDropdown
                    data={timeFilter}
                    defaultValue={timeFilter[2]}
                    onSelect={setDateRangeLength}
                    className={styles.dateRangePicker}
                />
            </div>
            <div className={styles.grid}>
                {SUPPORTED_WEB_VITALS.map((webVital) => (
                    <DashboardCard
                        webVitalName={webVital}
                        key={webVital}
                        dateRange={{
                            startDate: moment(new Date())
                                .subtract(dateRangeLength, 'days')
                                .startOf('day')
                                .toISOString(),
                            endDate: moment(new Date())
                                .endOf('day')
                                .toISOString(),
                        }}
                    />
                ))}
            </div>
        </>
    );
};

export default DashboardPage;
