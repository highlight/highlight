import Button from '@components/Button/Button/Button';
import Card from '@components/Card/Card';
import DotsMenu from '@components/DotsMenu/DotsMenu';
import InfoTooltip from '@components/InfoTooltip/InfoTooltip';
import Input from '@components/Input/Input';
import LineChart from '@components/LineChart/LineChart';
import MenuItem from '@components/Menu/MenuItem';
import Modal from '@components/Modal/Modal';
import ModalBody from '@components/ModalBody/ModalBody';
import { Skeleton } from '@components/Skeleton/Skeleton';
import { useGetMetricsDashboardQuery } from '@graph/hooks';
import { DashboardMetricConfig, DashboardPayload, Maybe } from '@graph/schemas';
import SvgAnnouncementIcon from '@icons/AnnouncementIcon';
import SvgDragIcon from '@icons/DragIcon';
import EditIcon from '@icons/EditIcon';
import TrashIcon from '@icons/TrashIcon';
import dashStyles from '@pages/Dashboards/pages/Dashboard/DashboardPage.module.scss';
import EmptyCardPlaceholder from '@pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder';
import { useParams } from '@util/react-router/useParams';
import { Menu } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import styles from './DashboardCard.module.scss';

type UpdateMetricFn = (idx: number, value: DashboardMetricConfig) => void;
type DeleteMetricFn = (idx: number) => void;

interface Props {
    metricIdx: number;
    metricConfig: DashboardMetricConfig;
    updateMetric: UpdateMetricFn;
    deleteMetric: DeleteMetricFn;
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
    deleteMetric,
    dateRange,
    isEditing,
}: Props) => {
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
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
            metric_type: metricConfig.type,
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
                data={data?.metrics_dashboard}
            />
            <Card
                interactable
                title={
                    <div className={styles.cardHeader}>
                        <h3>
                            {metricConfig.name}
                            {metricConfig.help_article && (
                                <InfoTooltip
                                    className={styles.infoTooltip}
                                    title={
                                        'Click to learn more about this metric.'
                                    }
                                    onClick={() => {
                                        window.open(
                                            metricConfig.help_article,
                                            '_blank'
                                        );
                                    }}
                                />
                            )}
                        </h3>
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
                                            <MenuItem
                                                icon={<TrashIcon />}
                                                onClick={() => {
                                                    setShowDeleteModal(true);
                                                }}
                                            >
                                                Delete Metric
                                            </MenuItem>
                                        </Menu>
                                    }
                                    trackingId="Dashboard"
                                />
                            )}
                        </div>
                        <Modal
                            visible={showDeleteModal}
                            onCancel={() => {
                                setShowDeleteModal(false);
                            }}
                            title={`Delete '${metricConfig.name}' Metric?`}
                            width={400}
                        >
                            <ModalBody>
                                <p className={styles.description}>
                                    Are you sure you want to delete this metric?
                                </p>
                                <div className={styles.actionsContainer}>
                                    <Button
                                        trackingId="ConfirmDeleteDashboardMetricCancel"
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                        }}
                                        type="default"
                                        className={styles.button}
                                    >
                                        Don't Delete Metric
                                    </Button>
                                    <Button
                                        trackingId="ConfirmDeleteDashboardMetric"
                                        danger
                                        type="primary"
                                        className={styles.button}
                                        onClick={() => {
                                            deleteMetric(metricIdx);
                                        }}
                                    >
                                        Delete Metric
                                    </Button>
                                </div>
                            </ModalBody>
                        </Modal>
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
                                color: 'var(--color-red-200)',
                            },
                            {
                                label: 'Needs Improvement',
                                value: metricConfig.poor_value,
                                color: 'var(--color-red-400)',
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
    data,
    shown = false,
}: {
    metricIdx: number;
    metricConfig: DashboardMetricConfig;
    updateMetric: UpdateMetricFn;
    onCancel: () => void;
    data?: Maybe<DashboardPayload>[];
    shown?: boolean;
}) => {
    const [units, setUnits] = useState<string>(metricConfig.units);
    const [helpArticle, setHelpArticle] = useState<string>(
        metricConfig.help_article
    );
    const [maxGoodValue, setMaxGoodValue] = useState<number>(
        metricConfig.max_good_value
    );
    const [
        maxNeedsImprovementValue,
        setMaxNeedsImprovementValue,
    ] = useState<number>(metricConfig.max_needs_improvement_value);
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
                        <Button
                            style={{ width: 90 }}
                            trackingId={'SaveMetric'}
                            onClick={() => {
                                updateMetric(metricIdx, {
                                    name: metricConfig.name,
                                    units: units,
                                    help_article: helpArticle,
                                    max_good_value: maxGoodValue,
                                    max_needs_improvement_value: maxNeedsImprovementValue,
                                    poor_value: poorValue,
                                });
                                onCancel();
                            }}
                        >
                            Save
                        </Button>
                    </div>
                </section>
                {!!data?.length && (
                    <section className={dashStyles.section}>
                        <LineChart
                            height={235}
                            data={data}
                            referenceLines={[
                                {
                                    label: 'Goal',
                                    value: maxGoodValue,
                                    color: 'var(--color-green-300)',
                                    onDrag: (y) => {
                                        setMaxGoodValue(y);
                                    },
                                },
                                {
                                    label: 'Needs Improvement',
                                    value: maxNeedsImprovementValue,
                                    color: 'var(--color-red-200)',
                                    onDrag: (y) => {
                                        setMaxNeedsImprovementValue(y);
                                    },
                                },
                                {
                                    label: 'Poor',
                                    value: poorValue,
                                    color: 'var(--color-red-400)',
                                    onDrag: (y) => {
                                        setPoorValue(y);
                                    },
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
                    </section>
                )}
            </ModalBody>
        </Modal>
    );
};

export default DashboardCard;
