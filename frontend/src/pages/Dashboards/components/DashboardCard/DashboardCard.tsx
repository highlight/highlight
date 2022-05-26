import Card from '@components/Card/Card';
import DotsMenu from '@components/DotsMenu/DotsMenu';
import LineChart from '@components/LineChart/LineChart';
import MenuItem from '@components/Menu/MenuItem';
import { Skeleton } from '@components/Skeleton/Skeleton';
import { useGetWebVitalDashboardQuery } from '@graph/hooks';
import SvgAnnouncementIcon from '@icons/AnnouncementIcon';
import SvgDragIcon from '@icons/DragIcon';
import EmptyCardPlaceholder from '@pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder';
import {
    WEB_VITALS_CONFIGURATION,
    WebVitalName,
} from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import { useParams } from '@util/react-router/useParams';
import { Menu } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import React from 'react';
import { useHistory } from 'react-router-dom';

import styles from './DashboardCard.module.scss';

interface Props {
    webVitalName: string;
    dateRange: {
        startDate: string;
        endDate: string;
    };
    isEditing?: boolean;
}

const DashboardCard = ({ webVitalName, dateRange, isEditing }: Props) => {
    const { project_id } = useParams<{ project_id: string }>();
    const { data, loading } = useGetWebVitalDashboardQuery({
        variables: {
            project_id,
            web_vital_name: webVitalName,
            params: {
                date_range: {
                    end_date: dateRange.endDate,
                    start_date: dateRange.startDate,
                },
            },
        },
    });

    const webVitalConfig = WEB_VITALS_CONFIGURATION[webVitalName];
    const history = useHistory();

    return (
        <Card
            interactable
            title={
                <div className={styles.cardHeader}>
                    {/* @ts-expect-error */}
                    <h3>{WebVitalName[webVitalName]}</h3>
                    <div
                        className={classNames(styles.headerActions, {
                            [styles.isEditing]: isEditing,
                        })}
                    >
                        {isEditing ? (
                            <div className={styles.draggable}>
                                <SvgDragIcon />
                            </div>
                        ) : (
                            <DotsMenu
                                menu={
                                    <Menu>
                                        <MenuItem
                                            icon={<SvgAnnouncementIcon />}
                                            onClick={() => {
                                                history.push(
                                                    `/${project_id}/alerts/new/monitor?type=${webVitalName}`
                                                );
                                            }}
                                        >
                                            Create Monitor
                                        </MenuItem>
                                    </Menu>
                                }
                                trackingId="Dashboard"
                            />
                        )}
                    </div>
                </div>
            }
        >
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
                        p75: 'var(--color-green-600)',
                        p50: 'var(--color-blue-400)',
                        avg: 'var(--color-gray-400)',
                    }}
                    yAxisLabel={WEB_VITALS_CONFIGURATION[webVitalName].units}
                />
            )}
        </Card>
    );
};

export default DashboardCard;
