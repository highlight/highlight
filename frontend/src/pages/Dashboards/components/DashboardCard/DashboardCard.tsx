import BarChartV2 from '@components/BarChartV2/BarCharV2';
import Button from '@components/Button/Button/Button';
import Card from '@components/Card/Card';
import { StandardDropdown } from '@components/Dropdown/StandardDropdown/StandardDropdown';
import { DropdownIndicator } from '@components/DropdownIndicator/DropdownIndicator';
import InfoTooltip from '@components/InfoTooltip/InfoTooltip';
import Input from '@components/Input/Input';
import LineChart, { Reference } from '@components/LineChart/LineChart';
import Modal from '@components/Modal/Modal';
import ModalBody from '@components/ModalBody/ModalBody';
import { Skeleton } from '@components/Skeleton/Skeleton';
import Switch from '@components/Switch/Switch';
import {
    useGetMetricMonitorsQuery,
    useGetMetricsHistogramLazyQuery,
    useGetMetricsTimelineLazyQuery,
    useGetSuggestedMetricsQuery,
} from '@graph/hooks';
import {
    DashboardChartType,
    DashboardMetricConfig,
    MetricAggregator,
} from '@graph/schemas';
import { SingleValue } from '@highlight-run/react-select';
import AsyncSelect from '@highlight-run/react-select/async';
import SvgAnnouncementIcon from '@icons/AnnouncementIcon';
import SvgDragIcon from '@icons/DragIcon';
import EditIcon from '@icons/EditIcon';
import SaveIcon from '@icons/SaveIcon';
import TrashIcon from '@icons/TrashIcon';
import dashStyles from '@pages/Dashboards/pages/Dashboard/DashboardPage.module.scss';
import EmptyCardPlaceholder from '@pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder';
import { WEB_VITALS_CONFIGURATION } from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import { styleProps } from '@pages/Sessions/SessionsFeedV2/components/QuickSearch/QuickSearch';
import { useParams } from '@util/react-router/useParams';
import { Form } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import styles from './DashboardCard.module.scss';

export const UNIT_OPTIONS = [
    { label: 'Milliseconds', value: 'ms' },
    { label: 'Seconds', value: 's' },
    { label: 'No Units', value: '' },
];

type UpdateMetricFn = (idx: number, value: DashboardMetricConfig) => void;
type DeleteMetricFn = (idx: number) => void;

interface Props {
    metricIdx: number;
    metricConfig: DashboardMetricConfig;
    updateMetric: UpdateMetricFn;
    deleteMetric: DeleteMetricFn;
    lookbackMinutes: number;
}

const DashboardCard = ({
    metricIdx,
    metricConfig,
    updateMetric,
    deleteMetric,
    lookbackMinutes,
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
                        <div className={classNames(styles.headerActions)}>
                            <div className={styles.chartButtons}>
                                {metricConfig.name.length ? (
                                    metricMonitorsLoading ? (
                                        <Skeleton width={111} />
                                    ) : metricMonitors?.metric_monitors
                                          .length ? (
                                        <StandardDropdown
                                            display={
                                                <div>
                                                    <SvgAnnouncementIcon
                                                        style={{
                                                            marginBottom: -3,
                                                            marginRight:
                                                                'var(--size-xSmall)',
                                                        }}
                                                    />
                                                    {
                                                        metricMonitors
                                                            ?.metric_monitors
                                                            .length
                                                    }
                                                    {metricMonitors
                                                        ?.metric_monitors
                                                        .length > 1
                                                        ? ' Monitors'
                                                        : ' Monitor'}
                                                </div>
                                            }
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
                                    )
                                ) : (
                                    <div style={{ width: 161 }}></div>
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
                                <div className={styles.draggable}>
                                    <SvgDragIcon />
                                </div>
                            </div>
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
                    aggregator={metricConfig.aggregator}
                    maxGoodValue={metricConfig.max_good_value}
                    maxNeedsImprovementValue={
                        metricConfig.max_needs_improvement_value
                    }
                    poorValue={metricConfig.poor_value}
                    updateMetric={updateMetric}
                    lookbackMinutes={lookbackMinutes}
                    showEditModal={showEditModal}
                    setShowEditModal={setShowEditModal}
                    setShowDeleteModal={setShowDeleteModal}
                />
            </Card>
        </>
    );
};

interface MetricOption {
    value: string;
    label: string;
}

export const MetricSelector = ({
    onSelectMetric,
}: {
    onSelectMetric: (metricName: string) => void;
}) => {
    const { project_id } = useParams<{ project_id: string }>();
    const [isTyping, setIsTyping] = useState(false);
    const { data: suggestedMetrics, loading } = useGetSuggestedMetricsQuery({
        variables: {
            project_id,
            prefix: '',
        },
    });

    const getValueOptions = (
        input: string,
        callback: (s: MetricOption[]) => void
    ) => {
        const options =
            suggestedMetrics?.suggested_metrics
                .filter(
                    (m) => m.toLowerCase().indexOf(input.toLowerCase()) !== -1
                )
                .map((s) => ({
                    label: s,
                    value: s,
                })) || [];
        setIsTyping(false);
        callback(options);
    };

    // Ignore this so we have a consistent reference so debounce works.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadOptions = useMemo(() => _.debounce(getValueOptions, 100), [
        suggestedMetrics?.suggested_metrics,
    ]);

    return (
        <div className={dashStyles.container}>
            <DropdownIndicator height={26} isLoading={loading || isTyping} />
            <AsyncSelect
                // @ts-expect-error
                styles={{
                    ...styleProps,
                    valueContainer: (provided) => ({
                        ...provided,
                        padding: '0 12px',
                        height: '40px',
                        cursor: 'text',
                    }),
                }}
                components={{
                    DropdownIndicator: () => (
                        <div className={dashStyles.dropdownPlaceholder}></div>
                    ),
                }}
                loadOptions={(
                    input,
                    callback: (options: MetricOption[]) => void
                ) => {
                    loadOptions(input, callback);
                }}
                onInputChange={(newValue) => {
                    setIsTyping(newValue !== '');
                }}
                onChange={(
                    newValue: SingleValue<{
                        value?: string;
                        label?: string;
                    }>
                ) => {
                    onSelectMetric(newValue?.value || '');
                }}
                isLoading={loading}
                isClearable={false}
                escapeClearsValue={true}
                defaultOptions={suggestedMetrics?.suggested_metrics.map(
                    (k) =>
                        ({
                            label: k,
                            value: k,
                        } as MetricOption)
                )}
                noOptionsMessage={({ inputValue }) =>
                    !inputValue ? null : `No results for "${inputValue}"`
                }
                placeholder="Search for a metric..."
                isSearchable
                maxMenuHeight={500}
            />
        </div>
    );
};

const EditMetricModal = ({
    metricIdx,
    metricConfig,
    updateMetric,
    onDelete,
    onCancel,
    shown = false,
}: {
    metricIdx: number;
    metricConfig: DashboardMetricConfig;
    updateMetric: UpdateMetricFn;
    onDelete: () => void;
    onCancel: () => void;
    shown?: boolean;
}) => {
    const [minValue, setMinValue] = useState<boolean>(
        metricConfig.min_value !== null
    );
    const [maxValue, setMaxValue] = useState<boolean>(
        metricConfig.max_value !== null
    );
    const [min, setMin] = useState<number>(
        metricConfig.min_value || metricConfig.min_percentile || 0
    );
    const [max, setMax] = useState<number>(
        metricConfig.max_value || metricConfig.max_percentile || 0
    );
    const [units, setUnits] = useState<string>(metricConfig.units);
    const [metricName, setMetricName] = useState<string>(metricConfig.name);
    const [description, setDescription] = useState<string>(
        metricConfig.description
    );
    const [chartType, setChartType] = useState<DashboardChartType>(
        metricConfig.chart_type
    );
    const [aggregator, setAggregator] = useState<MetricAggregator>(
        metricConfig.aggregator
    );
    console.log({ metricConfig, minValue, min, maxValue, max });
    return (
        <Modal
            onCancel={onCancel}
            visible={shown}
            title={'Edit Metric'}
            width="800px"
            mask
        >
            <ModalBody>
                <section className={dashStyles.section}>
                    <div className={dashStyles.metric}>
                        <MetricSelector onSelectMetric={setMetricName} />
                        <StandardDropdown
                            data={Object.values(MetricAggregator).map((v) => ({
                                label: v,
                                value: v,
                            }))}
                            defaultValue={
                                Object.values(MetricAggregator)
                                    .filter(
                                        (x) => x === metricConfig.aggregator
                                    )
                                    .map((v) => ({
                                        label: v,
                                        value: v,
                                    }))[0]
                            }
                            onSelect={(value) => setAggregator(value)}
                        />
                        <StandardDropdown
                            data={UNIT_OPTIONS}
                            defaultValue={
                                UNIT_OPTIONS.filter(
                                    (x) => x.value === metricConfig.units
                                )[0]
                            }
                            onSelect={(value) => setUnits(value)}
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
                        <Input
                            placeholder="Description"
                            name="Description"
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target?.value || '');
                            }}
                        />
                    </div>
                </section>
                {chartType === DashboardChartType.Histogram && (
                    <section className={dashStyles.section}>
                        <div className={styles.minMaxRow}>
                            <Form.Item
                                label="Minimum"
                                className={styles.percentileInput}
                            />
                            <Input
                                type={'number'}
                                placeholder="Min"
                                name="Min"
                                value={min * 100}
                                min={minValue ? undefined : 0}
                                max={minValue ? undefined : 100}
                                onChange={(e) => {
                                    setMin(
                                        (Number(e.target?.value) || 0) / 100
                                    );
                                }}
                            />
                            <Switch
                                label={minValue ? 'Value' : 'Percentile'}
                                trackingId={
                                    'EditDashboardChartMinPercentileToggle'
                                }
                                checked={!minValue}
                                onChange={(checked) => {
                                    setMinValue(!checked);
                                }}
                            />
                            <Form.Item
                                label="Maximum"
                                className={styles.percentileInput}
                            />
                            <Input
                                type={'number'}
                                placeholder="Max"
                                name="Max"
                                value={max * 100}
                                min={maxValue ? undefined : 0}
                                max={maxValue ? undefined : 100}
                                onChange={(e) => {
                                    setMax(
                                        (Number(e.target?.value) || 0) / 100
                                    );
                                }}
                            />
                            <Switch
                                label={maxValue ? 'Value' : 'Percentile'}
                                trackingId={
                                    'EditDashboardChartMaxPercentileToggle'
                                }
                                checked={!maxValue}
                                onChange={(checked) => {
                                    setMaxValue(!checked);
                                }}
                            />
                        </div>
                    </section>
                )}
                <section className={dashStyles.section}>
                    <div className={styles.submitRow}>
                        <Button
                            type={'primary'}
                            style={{
                                width: 90,
                                marginRight: 'var(--size-xSmall)',
                            }}
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
                                    name: metricName,
                                    description: description,
                                    units: units,
                                    help_article: metricConfig.help_article,
                                    max_good_value: metricConfig.max_good_value,
                                    max_needs_improvement_value:
                                        metricConfig.max_needs_improvement_value,
                                    poor_value: metricConfig.poor_value,
                                    chart_type: chartType,
                                    aggregator: aggregator,
                                    ...(minValue
                                        ? { min_value: min }
                                        : { min_percentile: min }),
                                    ...(maxValue
                                        ? { max_value: max }
                                        : { max_percentile: max }),
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
            </ModalBody>
        </Modal>
    );
};

const roundDate = (d: moment.Moment, toMinutes: number) => {
    const remainder = toMinutes - (d.minute() % toMinutes);
    return d.add(remainder, 'minutes');
};

const ChartContainer = React.memo(
    ({
        metricIdx,
        metricConfig,
        chartType,
        aggregator,
        maxGoodValue,
        maxNeedsImprovementValue,
        poorValue,
        setMaxGoodValue,
        setMaxNeedsImprovementValue,
        setPoorValue,
        updateMetric,
        lookbackMinutes,
        showEditModal,
        setShowEditModal,
        setShowDeleteModal,
    }: {
        metricIdx: number;
        metricConfig: DashboardMetricConfig;
        chartType: DashboardChartType;
        aggregator: MetricAggregator;
        maxGoodValue: number;
        maxNeedsImprovementValue: number;
        poorValue: number;
        setMaxGoodValue?: (v: number) => void;
        setMaxNeedsImprovementValue?: (v: number) => void;
        setPoorValue?: (v: number) => void;
        updateMetric: UpdateMetricFn;
        lookbackMinutes: number;
        showEditModal: boolean;
        setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>;
        setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
    }) => {
        const NUM_BUCKETS = 60;
        const BUCKET_MINS = lookbackMinutes / NUM_BUCKETS;
        const TICK_EVERY_BUCKETS = 10;
        const { project_id } = useParams<{ project_id: string }>();
        const [dateRange, setDateRange] = React.useState<{
            start_date: string;
            end_date: string;
        }>();
        const resolutionMinutes = Math.ceil(
            moment.duration(lookbackMinutes, 'minutes').as('minutes') /
                NUM_BUCKETS
        );
        const [
            loadTimeline,
            { data: timelineData, loading: timelineLoading },
        ] = useGetMetricsTimelineLazyQuery({
            variables: {
                project_id,
                metric_name: metricConfig.name,
                params: {
                    aggregator: aggregator,
                    date_range: dateRange,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    resolution_minutes: resolutionMinutes,
                    units: metricConfig.units,
                },
            },
            fetchPolicy: 'cache-first',
        });
        const [
            loadHistogram,
            { data: histogramData, loading: histogramLoading },
        ] = useGetMetricsHistogramLazyQuery({
            variables: {
                project_id,
                metric_name: metricConfig.name,
                params: {
                    date_range: dateRange,
                    buckets: NUM_BUCKETS,
                    units: metricConfig.units,
                    min_value: metricConfig.min_value,
                    min_percentile: metricConfig.min_percentile,
                    max_value: metricConfig.max_value,
                    max_percentile: metricConfig.max_percentile,
                },
            },
            fetchPolicy: 'cache-first',
        });

        useEffect(() => {
            if (chartType === DashboardChartType.Histogram) {
                loadHistogram();
            } else if (chartType === DashboardChartType.Timeline) {
                loadTimeline();
            }
        }, [chartType, loadTimeline, loadHistogram]);
        useEffect(() => {
            // round to the nearest 15 mins or less if we use a fine granularity.
            // this ensures that even for large time ranges data will only be cached
            // for up to 15 minutes (cache key is based on the arguments).
            const now = roundDate(
                moment(new Date()),
                Math.min(15, lookbackMinutes)
            );
            setDateRange({
                start_date: moment(now)
                    .subtract(lookbackMinutes, 'minutes')
                    .format('YYYY-MM-DDTHH:mm:00.000000000Z'),
                end_date: now.format('YYYY-MM-DDTHH:mm:59.999999999Z'),
            });
        }, [lookbackMinutes]);

        const tickFormat = lookbackMinutes > 24 * 60 ? 'D MMM' : 'HH:mm';
        const ticks: string[] = [];
        const seenDays: Set<string> = new Set<string>();
        let lastDate: moment.Moment | undefined = undefined;
        for (const d of timelineData?.metrics_timeline || []) {
            const pointDate = d?.date;
            if (pointDate) {
                const newDate = moment(pointDate);
                if (
                    lastDate &&
                    newDate.diff(lastDate, 'minutes') <
                        BUCKET_MINS * TICK_EVERY_BUCKETS
                ) {
                    continue;
                }
                lastDate = moment(newDate);
                const formattedDate = newDate.format(tickFormat);
                if (!seenDays.has(formattedDate)) {
                    ticks.push(d.date);
                    seenDays.add(formattedDate);
                }
            }
        }
        let referenceLines: Reference[] = [];
        if (WEB_VITALS_CONFIGURATION[metricConfig.name]) {
            referenceLines = [
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
            ];
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
                />
                {!dateRange || timelineLoading || histogramLoading ? (
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
                        data={histogramData?.metrics_histogram.buckets || []}
                        referenceLines={referenceLines}
                        barColorMapping={{
                            count: 'var(--color-purple-500)',
                        }}
                        xAxisDataKeyName="range_end"
                        xAxisLabel={metricConfig.units}
                        xAxisTickFormatter={(value: number) =>
                            value < 1 ? value.toFixed(2) : value.toFixed(0)
                        }
                        xAxisUnits={metricConfig.units}
                        yAxisLabel={'occurrences'}
                        yAxisKeys={['count']}
                    />
                ) : chartType === DashboardChartType.Timeline ? (
                    <LineChart
                        height={235}
                        data={(timelineData?.metrics_timeline || []).map(
                            (x) => ({
                                date: x?.date,
                                [x?.aggregator ||
                                MetricAggregator.Avg]: x?.value,
                            })
                        )}
                        referenceLines={referenceLines}
                        xAxisDataKeyName="date"
                        xAxisTickFormatter={(tickItem) => {
                            return moment(tickItem).format(tickFormat);
                        }}
                        xAxisProps={{
                            ticks: ticks,
                            domain: ['dataMin', 'dataMax'],
                            scale: 'point',
                        }}
                        lineColorMapping={{
                            [MetricAggregator.Max]: 'var(--color-red-500)',
                            [MetricAggregator.P99]: 'var(--color-red-400)',
                            [MetricAggregator.P95]: 'var(--color-orange-500)',
                            [MetricAggregator.P90]: 'var(--color-orange-400)',
                            [MetricAggregator.P75]: 'var(--color-green-600)',
                            [MetricAggregator.P50]: 'var(--color-blue-400)',
                            [MetricAggregator.Avg]: 'var(--color-gray-400)',
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
        prevProps.aggregator === nextProps.aggregator &&
        prevProps.lookbackMinutes === nextProps.lookbackMinutes &&
        prevProps.maxGoodValue === nextProps.maxGoodValue &&
        prevProps.maxNeedsImprovementValue ===
            nextProps.maxNeedsImprovementValue &&
        prevProps.poorValue === nextProps.poorValue &&
        prevProps.metricIdx === nextProps.metricIdx &&
        prevProps.metricConfig.name === nextProps.metricConfig.name &&
        prevProps.metricConfig.chart_type ===
            nextProps.metricConfig.chart_type &&
        prevProps.metricConfig.units === nextProps.metricConfig.units &&
        prevProps.metricConfig.description ===
            nextProps.metricConfig.description &&
        prevProps.metricConfig.min_value === nextProps.metricConfig.min_value &&
        prevProps.metricConfig.min_percentile ===
            nextProps.metricConfig.min_percentile &&
        prevProps.metricConfig.max_value === nextProps.metricConfig.max_value &&
        prevProps.metricConfig.max_percentile ===
            nextProps.metricConfig.max_percentile
);

export default DashboardCard;
