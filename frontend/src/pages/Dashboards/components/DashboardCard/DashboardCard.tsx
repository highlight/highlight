import Card from '@components/Card/Card';
import LineChart from '@components/LineChart/LineChart';
import { Skeleton } from '@components/Skeleton/Skeleton';
import { useGetWebVitalDashboardQuery } from '@graph/hooks';
import { WebVitalName } from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import { useParams } from '@util/react-router/useParams';
import moment from 'moment';
import React from 'react';

interface Props {
    webVitalName: string;
}

const DashboardCard = ({ webVitalName }: Props) => {
    const { project_id } = useParams<{ project_id: string }>();
    const { data, loading } = useGetWebVitalDashboardQuery({
        variables: { project_id, web_vital_name: webVitalName },
    });

    if (!loading) {
        console.log(data?.web_vital_dashboard);
    }
    return (
        // @ts-expect-error
        <Card interactable title={WebVitalName[webVitalName]}>
            {loading ? (
                <Skeleton height={235} />
            ) : (
                <LineChart
                    height={235}
                    data={data?.web_vital_dashboard || []}
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
                />
            )}
        </Card>
    );
};

export default DashboardCard;
