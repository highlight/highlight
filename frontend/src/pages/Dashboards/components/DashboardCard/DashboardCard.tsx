import BarChartV2 from '@components/BarChartV2/BarCharV2';
import Button from '@components/Button/Button/Button';
import Card from '@components/Card/Card';
import { StandardDropdown } from '@components/Dropdown/StandardDropdown/StandardDropdown';
import InfoTooltip from '@components/InfoTooltip/InfoTooltip';
import Input from '@components/Input/Input';
import LineChart from '@components/LineChart/LineChart';
import Modal from '@components/Modal/Modal';
import ModalBody from '@components/ModalBody/ModalBody';
import { Skeleton } from '@components/Skeleton/Skeleton';
import {
    useGetMetricMonitorsQuery,
    useGetMetricsDashboardQuery,
    useGetMetricsHistogramQuery,
} from '@graph/hooks';
import { DashboardChartType, DashboardMetricConfig } from '@graph/schemas';
import SvgAnnouncementIcon from '@icons/AnnouncementIcon';
import SvgDragIcon from '@icons/DragIcon';
import EditIcon from '@icons/EditIcon';
import SaveIcon from '@icons/SaveIcon';
import TrashIcon from '@icons/TrashIcon';
import dashStyles from '@pages/Dashboards/pages/Dashboard/DashboardPage.module.scss';
import EmptyCardPlaceholder from '@pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder';
import { useParams } from '@util/react-router/useParams';
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
        start: moment.Moment;
        end: moment.Moment;
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
    const {
        data: metricMonitors,
        loading: metricMonitorsLoading,
    } = useGetMetricMonitorsQuery({
        variables: {
            project_id,
            metric_name: metricConfig.name,
        },
    });

    const history = useHistory();

    return (
        <>
            <Card
                interactable
                style={{ paddingTop: 'var(--size-small)' }}
                title={
                    <div className={styles.cardHeader}>
                        <h3
                            style={{
                                paddingTop: 'var(--size-medium)',
                                paddingLeft: 'var(--size-small)',
                                paddingRight: 'var(--size-small)',
                            }}
                        >
                            {metricConfig.description || metricConfig.name}
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
                                <div className={styles.chartButtons}>
                                    {metricMonitorsLoading ? (
                                        <Skeleton width={111} />
                                    ) : metricMonitors?.metric_monitors
                                          .length ? (
                                        <StandardDropdown
                                            data={metricMonitors?.metric_monitors.map(
                                                (mm) => ({
                                                    label: mm?.name || '',
                                                    value: mm?.id || '',
                                                })
                                            )}
                                            onSelect={(mmId) =>
                                                history.push(
                                                    `/${project_id}/alerts/monitor/${mmId}`
                                                )
                                            }
                                            className={styles.monitorItem}
                                            labelClassName={styles.monitorName}
                                        />
                                    ) : (
                                        <Button
                                            icon={
                                                <SvgAnnouncementIcon
                                                    style={{
                                                        marginRight:
                                                            'var(--size-xSmall)',
                                                    }}
                                                />
                                            }
                                            trackingId={
                                                'DashboardCardCreateMonitor'
                                            }
                                            onClick={() => {
                                                history.push(
                                                    `/${project_id}/alerts/new/monitor?type=${metricConfig.name}`
                                                );
                                            }}
                                        >
                                            Create Alert
                                        </Button>
                                    )}
                                    <Button
                                        icon={
                                            <EditIcon
                                                style={{
                                                    marginRight:
                                                        'var(--size-xSmall)',
                                                }}
                                            />
                                        }
                                        trackingId={'DashboardCardEditMetric'}
                                        onClick={() => {
                                            setShowEditModal(true);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                </div>
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
                <ChartContainer
                    metricIdx={metricIdx}
                    metricConfig={metricConfig}
                    chartType={metricConfig.chart_type}
                    maxGoodValue={metricConfig.max_good_value}
                    maxNeedsImprovementValue={
                        metricConfig.max_needs_improvement_value
                    }
                    poorValue={metricConfig.poor_value}
                    updateMetric={updateMetric}
                    dateRange={dateRange}
                    showEditModal={showEditModal}
                    setShowEditModal={setShowEditModal}
                    setShowDeleteModal={setShowDeleteModal}
                />
            </Card>
        </>
    );
};

const EditMetricModal = ({
    metricIdx,
    metricConfig,
    updateMetric,
    onDelete,
    onCancel,
    dateRange,
    setShowEditModal,
    setShowDeleteModal,
    shown = false,
}: {
    metricIdx: number;
    metricConfig: DashboardMetricConfig;
    updateMetric: UpdateMetricFn;
    onDelete: () => void;
    onCancel: () => void;
    dateRange: {
        start: moment.Moment;
        end: moment.Moment;
    };
    setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>;
    setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
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
    const [chartType, setChartType] = useState<DashboardChartType>(
        metricConfig.chart_type
    );
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
                        <StandardDropdown
                            data={Object.keys(DashboardChartType).map(
                                (value) => ({
                                    label: value,
                                    value: value,
                                })
                            )}
                            defaultValue={{
                                label: chartType,
                                value: chartType,
                            }}
                            onSelect={(value) => setChartType(value)}
                        />
                        <Button
                            style={{ width: 90 }}
                            icon={
                                <SaveIcon
                                    style={{
                                        marginRight: 'var(--size-xSmall)',
                                    }}
                                />
                            }
                            trackingId={'SaveMetric'}
                            onClick={() => {
                                updateMetric(metricIdx, {
                                    name: metricConfig.name,
                                    description: metricConfig.description,
                                    units: units,
                                    help_article: helpArticle,
                                    max_good_value: maxGoodValue,
                                    max_needs_improvement_value: maxNeedsImprovementValue,
                                    poor_value: poorValue,
                                    type: metricConfig.type,
                                    chart_type: chartType,
                                });
                                onCancel();
                            }}
                        >
                            Save
                        </Button>
                        <Button
                            style={{ width: 100 }}
                            icon={
                                <TrashIcon
                                    style={{
                                        marginRight: 'var(--size-xSmall)',
                                    }}
                                />
                            }
                            danger
                            trackingId={'DashboardCardDeleteMonitor'}
                            onClick={onDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </section>
                <section className={dashStyles.section}>
                    <ChartContainer
                        metricIdx={metricIdx}
                        metricConfig={metricConfig}
                        chartType={chartType}
                        maxGoodValue={maxGoodValue}
                        maxNeedsImprovementValue={maxNeedsImprovementValue}
                        poorValue={poorValue}
                        setMaxGoodValue={setMaxGoodValue}
                        setMaxNeedsImprovementValue={
                            setMaxNeedsImprovementValue
                        }
                        setPoorValue={setPoorValue}
                        showEditModal={false}
                        dateRange={dateRange}
                        setShowDeleteModal={setShowDeleteModal}
                        setShowEditModal={setShowEditModal}
                        updateMetric={updateMetric}
                    />
                </section>
            </ModalBody>
        </Modal>
    );
};

const ChartContainer = React.memo(
    ({
        metricIdx,
        metricConfig,
        chartType,
        maxGoodValue,
        maxNeedsImprovementValue,
        poorValue,
        setMaxGoodValue,
        setMaxNeedsImprovementValue,
        setPoorValue,
        updateMetric,
        dateRange,
        showEditModal,
        setShowEditModal,
        setShowDeleteModal,
    }: {
        metricIdx: number;
        metricConfig: DashboardMetricConfig;
        chartType: DashboardChartType;
        maxGoodValue: number;
        maxNeedsImprovementValue: number;
        poorValue: number;
        setMaxGoodValue?: (v: number) => void;
        setMaxNeedsImprovementValue?: (v: number) => void;
        setPoorValue?: (v: number) => void;
        updateMetric: UpdateMetricFn;
        dateRange: {
            start: moment.Moment;
            end: moment.Moment;
        };
        showEditModal: boolean;
        setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>;
        setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
    }) => {
        const { project_id } = useParams<{ project_id: string }>();
        const NUM_BUCKETS = 24;
        const resolutionMinutes = Math.ceil(
            dateRange.end.diff(dateRange.start, 'minute') / NUM_BUCKETS
        );
        const NUM_HISTOGRAM_BUCKETS = (3600 * 5000) / resolutionMinutes;
        const {
            data: timelineData,
            loading: timelineLoading,
        } = useGetMetricsDashboardQuery({
            variables: {
                project_id,
                metric_name: metricConfig.name,
                params: {
                    date_range: {
                        end_date: dateRange.end.toISOString(),
                        start_date: dateRange.start.toISOString(),
                    },
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    resolution_minutes: resolutionMinutes,
                },
                metric_type: metricConfig.type,
            },
        });
        const {
            data: histogramData,
            loading: histogramLoading,
        } = useGetMetricsHistogramQuery({
            variables: {
                project_id,
                metric_name: metricConfig.name,
                params: {
                    date_range: {
                        end_date: dateRange.end.toISOString(),
                        start_date: dateRange.start.toISOString(),
                    },
                    buckets: NUM_HISTOGRAM_BUCKETS,
                },
                metric_type: metricConfig.type,
            },
        });

        const ticks: string[] = [];
        const seenDays: Set<string> = new Set<string>();
        for (const d of timelineData?.metrics_timeline || []) {
            const pointDate = d?.date;
            if (pointDate) {
                const formattedDate = moment(pointDate).format('D MMM');
                if (!seenDays.has(formattedDate)) {
                    ticks.push(d.date);
                    seenDays.add(formattedDate);
                }
            }
        }

        return (
            <>
                <EditMetricModal
                    shown={showEditModal}
                    onCancel={() => {
                        setShowEditModal(false);
                    }}
                    onDelete={() => {
                        setShowDeleteModal(true);
                    }}
                    metricConfig={metricConfig}
                    metricIdx={metricIdx}
                    updateMetric={updateMetric}
                    dateRange={dateRange}
                    setShowDeleteModal={setShowDeleteModal}
                    setShowEditModal={setShowEditModal}
                />
                {timelineLoading || histogramLoading ? (
                    <Skeleton height={235} />
                ) : !timelineData?.metrics_timeline.length &&
                  !histogramData?.metrics_histogram.buckets.length ? (
                    <div className={styles.noDataContainer}>
                        <EmptyCardPlaceholder
                            message={`Doesn't look like we've gotten any ${metricConfig.name} data from your app yet. This is normal! You should start seeing data here a few hours after integrating.`}
                        />
                    </div>
                ) : chartType === DashboardChartType.Histogram ? (
                    <BarChartV2
                        height={235}
                        data={(
                            histogramData?.metrics_histogram.buckets || []
                        ).filter(
                            (x) =>
                                x.range_start <=
                                (histogramData?.metrics_histogram.p90 || 0)
                        )}
                        referenceLines={[
                            {
                                label: 'Goal',
                                value: maxGoodValue,
                                color: 'var(--color-green-300)',
                                onDrag:
                                    setMaxGoodValue &&
                                    ((y) => {
                                        setMaxGoodValue(y);
                                    }),
                            },
                            {
                                label: 'Needs Improvement',
                                value: maxNeedsImprovementValue,
                                color: 'var(--color-red-200)',
                                onDrag:
                                    setMaxNeedsImprovementValue &&
                                    ((y) => {
                                        setMaxNeedsImprovementValue(y);
                                    }),
                            },
                            {
                                label: 'Poor',
                                value: poorValue,
                                color: 'var(--color-red-400)',
                                onDrag:
                                    setPoorValue &&
                                    ((y) => {
                                        setPoorValue(y);
                                    }),
                            },
                        ]}
                        barColorMapping={{
                            count: 'var(--color-purple-500)',
                        }}
                        xAxisDataKeyName="range_start"
                        xAxisLabel={metricConfig.units}
                        xAxisTickFormatter={(value: number) => value.toFixed(0)}
                        yAxisLabel={'occurrences'}
                        yAxisKeys={['count']}
                    />
                ) : chartType === DashboardChartType.Timeline ? (
                    <LineChart
                        height={235}
                        data={timelineData?.metrics_timeline || []}
                        referenceLines={[
                            {
                                label: 'Goal',
                                value: maxGoodValue,
                                color: 'var(--color-green-300)',
                                onDrag:
                                    setMaxGoodValue &&
                                    ((y) => {
                                        setMaxGoodValue(y);
                                    }),
                            },
                            {
                                label: 'Needs Improvement',
                                value: maxNeedsImprovementValue,
                                color: 'var(--color-red-200)',
                                onDrag:
                                    setMaxNeedsImprovementValue &&
                                    ((y) => {
                                        setMaxNeedsImprovementValue(y);
                                    }),
                            },
                            {
                                label: 'Poor',
                                value: poorValue,
                                color: 'var(--color-red-400)',
                                onDrag:
                                    setPoorValue &&
                                    ((y) => {
                                        setPoorValue(y);
                                    }),
                            },
                        ]}
                        xAxisDataKeyName="date"
                        xAxisTickFormatter={(tickItem) => {
                            return moment(
                                new Date(tickItem),
                                'DD MMM YYYY'
                            ).format('D MMM');
                        }}
                        xAxisProps={{
                            ticks: ticks,
                            domain: ['dataMin', 'dataMax'],
                            scale: 'point',
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
                ) : null}
            </>
        );
    },
    (prevProps, nextProps) =>
        prevProps.showEditModal === nextProps.showEditModal &&
        prevProps.chartType === nextProps.chartType &&
        prevProps.dateRange === nextProps.dateRange &&
        prevProps.maxGoodValue === nextProps.maxGoodValue &&
        prevProps.maxNeedsImprovementValue ===
            nextProps.maxNeedsImprovementValue &&
        prevProps.poorValue === nextProps.poorValue &&
        prevProps.metricIdx === nextProps.metricIdx &&
        prevProps.metricConfig.chart_type === nextProps.metricConfig.chart_type
);

export default DashboardCard;
