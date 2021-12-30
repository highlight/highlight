import Card from '@components/Card/Card';
import LineChart from '@components/LineChart/LineChart';
import { Skeleton } from '@components/Skeleton/Skeleton';
import { useGetWebVitalDashboardQuery } from '@graph/hooks';
import EmptyCardPlaceholder from '@pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder';
import {
    WEB_VITALS_CONFIGURATION,
    WebVitalName,
} from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import { useParams } from '@util/react-router/useParams';
import moment from 'moment';
import React from 'react';

import styles from './DashboardCard.module.scss';

interface Props {
    webVitalName: string;
}

const DashboardCard = ({ webVitalName }: Props) => {
    const { project_id } = useParams<{ project_id: string }>();
    const { data, loading } = useGetWebVitalDashboardQuery({
        variables: { project_id, web_vital_name: webVitalName },
    });

    const webVitalConfig = WEB_VITALS_CONFIGURATION[webVitalName];

    return (
        // @ts-expect-error
        <Card interactable title={WebVitalName[webVitalName]}>
            {loading ? (
                <Skeleton height={235} />
            ) : data === undefined ||
              data.web_vital_dashboard === undefined ||
              data.web_vital_dashboard.length === 0 ? (
                <div className={styles.noDataContainer}>
                    <EmptyCardPlaceholder
                        message={`Doesn't look like we've gotten any ${webVitalName} data from your app yet. This is normal! You should start seeing data here a few hours after integrating.`}
                    />
                </div>
            ) : (
                <LineChart
                    height={235}
                    data={data.web_vital_dashboard}
                    referenceLines={[
                        {
                            label: 'Goal',
                            value: webVitalConfig.maxGoodValue,
                            color: 'var(--color-green-300)',
                        },
                        {
                            label: 'Needs Improvement',
                            value: webVitalConfig.maxNeedsImprovementValue,
                            color: 'var(--color-red-300)',
                        },
                    ]}
                    xAxisDataKeyName="date"
                    xAxisTickFormatter={(tickItem) => {
                        return moment(new Date(tickItem), 'DD MMM YYYY').format(
                            'D MMM'
                        );
                    }}
                    lineColorMapping={{
                        p99: 'var(--color-red-400)',
                        p90: 'var(--color-orange-400)',
                        p75: 'var(--color-yellow-400)',
                        avg: 'var(--color-green-700)',
                    }}
                    yAxisLabel={WEB_VITALS_CONFIGURATION[webVitalName].units}
                />
            )}
        </Card>
    );
};

export default DashboardCard;
