import ButtonLink from '@components/Button/ButtonLink/ButtonLink';
import LineChart from '@components/LineChart/LineChart';
import {
    useGetDashboardDefinitionsQuery,
    useGetMetricsTimelineQuery,
} from '@graph/hooks';
import {
    MetricAggregator,
    MetricTagFilterOp,
    NetworkRequestAttribute,
} from '@graph/schemas';
import { LINE_COLORS } from '@pages/Dashboards/components/DashboardCard/DashboardCard';
import { NetworkResource } from '@pages/Player/Toolbar/DevToolsWindow/ResourcePage/ResourcePage';
import { useParams } from '@util/react-router/useParams';
import { Dropdown, Menu, MenuProps } from 'antd';
import moment from 'moment';
import React from 'react';
import { useHistory } from 'react-router-dom';

import styles from './RequestMetrics.module.scss';

interface Props {
    resource: NetworkResource;
}

const RequestMetrics: React.FC<Props> = ({ resource }) => {
    const { project_id } = useParams<{ project_id: string }>();
    const { data, loading } = useGetMetricsTimelineQuery({
        variables: {
            project_id,
            metric_name: NetworkRequestAttribute.Latency,
            params: {
                aggregator: MetricAggregator.P50,
                date_range: {
                    end_date: moment().format(),
                    start_date: moment().subtract(1, 'hour').format(),
                },
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                resolution_minutes: 1,
                units: 'ms',
                filters: [
                    {
                        tag: 'url',
                        op: MetricTagFilterOp.Equals,
                        value: resource.name,
                    },
                ],
            },
        },
        fetchPolicy: 'cache-first',
    });
    const {
        data: dashboardsData,
        loading: dashboardsLoading,
    } = useGetDashboardDefinitionsQuery({
        variables: { project_id },
    });

    const history = useHistory();
    const duration = resource.responseEnd - resource.startTime;

    const handleDashboardclick: MenuProps['onClick'] = (e) => {
        history.push(
            `/${project_id}/dashboards/${e.key}?add_to_dashboard=true`
        );
    };

    const dashboardWithLatency = dashboardsData?.dashboard_definitions.find(
        (dashboard) =>
            dashboard?.metrics.find((metric) => metric.name === 'latency')
    );

    const dashboardItems = dashboardsData?.dashboard_definitions.map((dd) => ({
        label: dd?.name || '',
        key: dd?.id || 0,
    }));

    return (
        <div className={styles.requestMetrics}>
            {loading ? (
                <div>Loading...</div>
            ) : !data?.metrics_timeline.length ? (
                <div>No data</div>
            ) : (
                <div>
                    {dashboardWithLatency ? (
                        <ButtonLink
                            trackingId="viewDashboardFromNetworkRequestDetails"
                            to={`/${project_id}/dashboards/${dashboardWithLatency.id}`}
                        >
                            View on {dashboardWithLatency.name} Dashboard
                        </ButtonLink>
                    ) : (
                        <Dropdown.Button
                            overlay={
                                <Menu
                                    onClick={handleDashboardclick}
                                    items={dashboardItems}
                                />
                            }
                        >
                            Add to Dashboard
                        </Dropdown.Button>
                    )}

                    <LineChart
                        height={275}
                        data={(data?.metrics_timeline || []).map((x) => ({
                            date: x?.date,
                            [MetricAggregator.P50]: x?.value,
                        }))}
                        xAxisDataKeyName="date"
                        xAxisTickFormatter={(tickItem) =>
                            moment(tickItem).format()
                        }
                        xAxisProps={{
                            domain: ['dataMin', 'dataMax'],
                            scale: 'point',
                            interval: 0, // show all ticks
                        }}
                        lineColorMapping={LINE_COLORS}
                        yAxisLabel="ms"
                        referenceLines={[
                            {
                                label: 'This Request',
                                value: duration,
                                color: 'var(--color-red-300)',
                            },
                        ]}
                    />
                </div>
            )}
        </div>
    );
};

export default RequestMetrics;
