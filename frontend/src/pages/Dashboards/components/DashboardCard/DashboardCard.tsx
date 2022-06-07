import Button from '@components/Button/Button/Button';
import Card from '@components/Card/Card';
import DotsMenu from '@components/DotsMenu/DotsMenu';
import Input from '@components/Input/Input';
import LineChart from '@components/LineChart/LineChart';
import MenuItem from '@components/Menu/MenuItem';
import Modal from '@components/Modal/Modal';
import ModalBody from '@components/ModalBody/ModalBody';
import { Skeleton } from '@components/Skeleton/Skeleton';
import { useGetMetricsDashboardQuery } from '@graph/hooks';
import { DashboardMetricConfig } from '@graph/schemas';
import SvgAnnouncementIcon from '@icons/AnnouncementIcon';
import SvgDragIcon from '@icons/DragIcon';
import EditIcon from '@icons/EditIcon';
import dashStyles from '@pages/Dashboards/pages/Dashboard/DashboardPage.module.scss';
import EmptyCardPlaceholder from '@pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder';
import { useParams } from '@util/react-router/useParams';
import { Menu, Slider } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import styles from './DashboardCard.module.scss';

type UpdateMetricFn = (idx: number, value: DashboardMetricConfig) => void;

interface Props {
    metricIdx: number;
    metricConfig: DashboardMetricConfig;
    updateMetric: UpdateMetricFn;
    dateRange: {
        startDate: string;
        endDate: string;
    };
    isEditing?: boolean;
}

const DashboardCard = ({
    metricIdx,
    metricConfig,
    updateMetric,
    dateRange,
    isEditing,
}: Props) => {
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const { project_id } = useParams<{ project_id: string }>();
    const { data, loading } = useGetMetricsDashboardQuery({
        variables: {
            project_id,
            metric_name: metricConfig.name,
            params: {
                date_range: {
                    end_date: dateRange.endDate,
                    start_date: dateRange.startDate,
                },
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                resolution_minutes:
                    metricConfig.name === 'delayMS' ? 1 : 24 * 60,
            },
        },
    });

    const history = useHistory();

    return (
        <>
            <EditMetricModal
                shown={showEditModal}
                onCancel={() => {
                    setShowEditModal(false);
                }}
                metricConfig={metricConfig}
                metricIdx={metricIdx}
                updateMetric={updateMetric}
            />
            <Card
                interactable
                title={
                    <div className={styles.cardHeader}>
                        <h3>{metricConfig.name}</h3>
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
                                                        `/${project_id}/alerts/new/monitor?type=${metricConfig.name}`
                                                    );
                                                }}
                                            >
                                                Create Monitor
                                            </MenuItem>
                                            <MenuItem
                                                icon={<EditIcon />}
                                                onClick={() => {
                                                    setShowEditModal(true);
                                                }}
                                            >
                                                Edit Metric
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
                  data.metrics_dashboard === undefined ||
                  data.metrics_dashboard.length === 0 ? (
                    <div className={styles.noDataContainer}>
                        <EmptyCardPlaceholder
                            message={`Doesn't look like we've gotten any ${metricConfig.name} data from your app yet. This is normal! You should start seeing data here a few hours after integrating.`}
                        />
                    </div>
                ) : (
                    <LineChart
                        height={235}
                        data={data.metrics_dashboard}
                        referenceLines={[
                            {
                                label: 'Goal',
                                value: metricConfig.max_good_value,
                                color: 'var(--color-green-300)',
                            },
                            {
                                label: 'Needs Improvement',
                                value: metricConfig.max_needs_improvement_value,
                                color: 'var(--color-red-300)',
                            },
                        ]}
                        xAxisDataKeyName="date"
                        xAxisTickFormatter={(tickItem) => {
                            return moment(
                                new Date(tickItem),
                                'DD MMM YYYY'
                            ).format('D MMM');
                        }}
                        lineColorMapping={{
                            p99: 'var(--color-red-400)',
                            p90: 'var(--color-orange-400)',
                            p75: 'var(--color-green-600)',
                            p50: 'var(--color-blue-400)',
                            avg: 'var(--color-gray-400)',
                        }}
                        yAxisLabel={metricConfig.units}
                    />
                )}
            </Card>
        </>
    );
};

const EditMetricModal = ({
    metricIdx,
    metricConfig,
    updateMetric,
    onCancel,
    shown = false,
}: {
    metricIdx: number;
    metricConfig: DashboardMetricConfig;
    updateMetric: UpdateMetricFn;
    onCancel: () => void;
    shown?: boolean;
}) => {
    const [name, setName] = useState<string>(metricConfig.name);
    const [units, setUnits] = useState<string>(metricConfig.units);
    const [helpArticle, setHelpArticle] = useState<string>(
        metricConfig.help_article
    );
    const [maxGoodValue, setMaxGoodValue] = useState<number>(
        metricConfig.max_good_value
    );
    const [poorValue, setPoorValue] = useState<number>(metricConfig.poor_value);
    return (
        <Modal
            onCancel={onCancel}
            visible={shown}
            title={'Edit Metric'}
            width="800px"
        >
            <ModalBody>
                <section className={dashStyles.section}>
                    <div className={dashStyles.metric}>
                        <Input
                            placeholder="Metric"
                            name="Metric"
                            value={name}
                            onChange={(e) => {
                                setName(e.target?.value || '');
                            }}
                            autoFocus
                        />
                        <Input
                            placeholder="Units"
                            name="Units"
                            value={units}
                            onChange={(e) => {
                                setUnits(e.target?.value || '');
                            }}
                        />
                        <Input
                            placeholder="Help Article"
                            name="Help Article"
                            value={helpArticle}
                            onChange={(e) => {
                                setHelpArticle(e.target?.value || '');
                            }}
                        />
                        {/*TODO(vkorolik) incorporate all three values*/}
                        <Slider
                            range
                            step={1}
                            tooltipVisible={true}
                            tooltipPlacement={'top'}
                            getTooltipPopupContainer={() =>
                                document.querySelector('.ant-slider-step')!
                            }
                            disabled={false}
                            min={0}
                            max={1000}
                            value={[maxGoodValue, poorValue]}
                            onChange={([min, max]) => {
                                setMaxGoodValue(min);
                                setPoorValue(max);
                            }}
                        />
                        <Button
                            style={{ width: 90 }}
                            trackingId={'SaveMetric'}
                            onClick={() => {
                                updateMetric(metricIdx, {
                                    name: name,
                                    units: units,
                                    help_article: helpArticle,
                                    max_good_value: maxGoodValue,
                                    max_needs_improvement_value: poorValue,
                                    poor_value: poorValue,
                                });
                            }}
                        >
                            Save
                        </Button>
                    </div>
                </section>
            </ModalBody>
        </Modal>
    );
};

export default DashboardCard;
