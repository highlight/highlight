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
import Select from '@components/Select/Select';
import { Skeleton } from '@components/Skeleton/Skeleton';
import Switch from '@components/Switch/Switch';
import {
    useGetMetricMonitorsQuery,
    useGetMetricsHistogramLazyQuery,
    useGetMetricsTimelineLazyQuery,
    useGetMetricTagsQuery,
    useGetMetricTagValuesLazyQuery,
    useGetSuggestedMetricsQuery,
} from '@graph/hooks';
import {
    DashboardChartType,
    DashboardMetricConfig,
    MetricAggregator,
    MetricTagFilter,
} from '@graph/schemas';
import { SingleValue } from '@highlight-run/react-select';
import AsyncSelect from '@highlight-run/react-select/async';
import SvgAnnouncementIcon from '@icons/AnnouncementIcon';
import SvgDragIcon from '@icons/DragIcon';
import EditIcon from '@icons/EditIcon';
import SvgPlusIcon from '@icons/PlusIcon';
import SaveIcon from '@icons/SaveIcon';
import TrashIcon from '@icons/TrashIcon';
import { roundDate } from '@pages/Dashboards/pages/Dashboard/DashboardPage';
import dashStyles from '@pages/Dashboards/pages/Dashboard/DashboardPage.module.scss';
import EmptyCardPlaceholder from '@pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder';
import { WEB_VITALS_CONFIGURATION } from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import { styleProps } from '@pages/Sessions/SessionsFeedV2/components/QuickSearch/QuickSearch';
import { useParams } from '@util/react-router/useParams';
import { Form } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
    dateRange: { start_date: string; end_date: string };
    customDateRange: { label: string; value: number } | undefined;
    updateMetric: UpdateMetricFn;
    deleteMetric: DeleteMetricFn;
    setDateRange: (
        start_date: string,
        end_date: string,
        custom?: boolean
    ) => void;
}

const DashboardCard = ({
    metricIdx,
    metricConfig,
    dateRange,
    customDateRange,
    updateMetric,
    deleteMetric,
    setDateRange,
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
                className={styles.card}
                title={
                    <div className={styles.cardHeader}>
                        <h3
                            style={{
                                paddingTop: 'var(--size-medium)',
                                paddingLeft: 'var(--size-small)',
                                paddingRight: 'var(--size-small)',
                            }}
                        >
                            {metricConfig.description ||
                                metricConfig.name ||
                                'New Chart'}
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
                                    ) : (
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
                                                        .length === 1
                                                        ? ' Monitor'
                                                        : ' Monitors'}
                                                </div>
                                            }
                                            renderOption={(o) =>
                                                o.label ===
                                                'Create New Alert' ? (
                                                    <>
                                                        <div
                                                            className={
                                                                styles.createNewAlertRow
                                                            }
                                                        >
                                                            <SvgPlusIcon
                                                                style={{
                                                                    marginRight:
                                                                        'var(--size-xSmall)',
                                                                    marginBottom: 2,
                                                                }}
                                                            />
                                                            Create New Alert
                                                        </div>
                                                    </>
                                                ) : undefined
                                            }
                                            data={[
                                                ...(
                                                    metricMonitors?.metric_monitors ||
                                                    []
                                                ).map((mm) => ({
                                                    label: mm?.name || '',
                                                    value: mm?.id || '',
                                                })),
                                                {
                                                    label: 'Create New Alert',
                                                    value: -1,
                                                },
                                            ]}
                                            onSelect={(mmId) => {
                                                if (mmId === -1) {
                                                    history.push(
                                                        `/${project_id}/alerts/new/monitor?type=${metricConfig.name}`
                                                    );
                                                } else {
                                                    history.push(
                                                        `/${project_id}/alerts/monitor/${mmId}`
                                                    );
                                                }
                                            }}
                                            className={styles.monitorItem}
                                            labelClassName={styles.monitorName}
                                        />
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
                                <div
                                    className={styles.draggable}
                                    data-drag-handle=""
                                >
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
                                            setShowDeleteModal(false);
                                            setShowEditModal(false);
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
                    dateRange={dateRange}
                    customDateRange={customDateRange}
                    updateMetric={updateMetric}
                    showEditModal={showEditModal}
                    setShowEditModal={setShowEditModal}
                    setShowDeleteModal={setShowDeleteModal}
                    setDateRange={setDateRange}
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
    currentMetric,
}: {
    onSelectMetric: (metricName: string) => void;
    currentMetric?: string;
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
                defaultValue={
                    suggestedMetrics?.suggested_metrics
                        .filter((k) => k === currentMetric)
                        .map(
                            (k) =>
                                ({
                                    label: k,
                                    value: k,
                                } as MetricOption)
                        )[0]
                }
                defaultInputValue={currentMetric}
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

export const TagFilters = ({
    metricName,
    onSelectTags,
    currentTags,
}: {
    metricName: string;
    onSelectTags: (tags: MetricTagFilter[]) => void;
    currentTags: MetricTagFilter[];
}) => {
    return (
        <>
            {[...currentTags, undefined].map((v, idx) => (
                <section
                    className={dashStyles.section}
                    key={`tag-filter-${v?.tag || idx}`}
                >
                    <div className={styles.filtersRow}>
                        <Form.Item
                            label="Filter by:"
                            className={styles.formLabel}
                        />
                        <TagFilterSelector
                            metricName={metricName}
                            onSelectTag={(t) => {
                                // ensure changing an existing tag updates rather than adding
                                const newTags = [];
                                for (const x of currentTags) {
                                    if (x.tag === t.tag) {
                                        newTags.push({
                                            tag: x.tag,
                                            value: t.value,
                                        } as MetricTagFilter);
                                    } else {
                                        newTags.push(x);
                                    }
                                }
                                onSelectTags(newTags);
                            }}
                            currentTag={v}
                            usedTags={currentTags.map((t) => t.tag)}
                        />
                        <Button
                            trackingId={'EditMetricRemoveTagFilter'}
                            className={styles.removeTagFilterButton}
                            onClick={() => {
                                onSelectTags(
                                    currentTags.filter((t) => t.tag !== v?.tag)
                                );
                            }}
                        >
                            <TrashIcon />
                        </Button>
                    </div>
                </section>
            ))}
        </>
    );
};

export const TagFilterSelector = ({
    metricName,
    onSelectTag,
    currentTag,
    usedTags,
}: {
    metricName: string;
    onSelectTag: (tags: MetricTagFilter) => void;
    currentTag?: MetricTagFilter;
    usedTags?: string[];
}) => {
    const [tag, setTag] = useState<string | undefined>(currentTag?.tag);
    const [value, setValue] = useState<string | undefined>(currentTag?.value);
    const { project_id } = useParams<{ project_id: string }>();
    const { data } = useGetMetricTagsQuery({
        variables: {
            project_id,
            metric_name: metricName,
        },
    });
    const [load, { data: values }] = useGetMetricTagValuesLazyQuery({
        variables: {
            project_id,
            metric_name: metricName,
            tag_name: tag || '',
        },
    });

    useEffect(() => {
        if (tag?.length) {
            load();
        }
    }, [tag, load]);

    return (
        <>
            <Select
                placeholder={`graphql_operation`}
                options={
                    data?.metric_tags
                        .filter((t) =>
                            usedTags ? !usedTags.includes(t) : true
                        )
                        .map((t) => ({
                            value: t,
                            id: t,
                            displayValue: t,
                        })) || []
                }
                value={tag}
                onChange={(t) => {
                    setTag(t);
                    setValue(undefined);
                }}
            />
            <Select
                placeholder={`GetSession`}
                options={
                    values?.metric_tag_values.map((t) => ({
                        value: t,
                        id: t,
                        displayValue: t,
                    })) || []
                }
                value={value}
                onChange={(v) => {
                    setValue(v);
                    if (tag?.length) {
                        onSelectTag({ tag: tag, value: v });
                    }
                }}
            />
        </>
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
        metricConfig.max_value || metricConfig.max_percentile || 100
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
    const [filters, setFilters] = useState<MetricTagFilter[]>(
        metricConfig.filters || []
    );
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
                        <MetricSelector
                            onSelectMetric={setMetricName}
                            currentMetric={metricName}
                        />
                        {chartType === DashboardChartType.Timeline ? (
                            <StandardDropdown
                                data={Object.values(MetricAggregator).map(
                                    (v) => ({
                                        label: v,
                                        value: v,
                                    })
                                )}
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
                        ) : (
                            <div />
                        )}
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
                                className={styles.formLabel}
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
                                className={styles.formLabel}
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
                <TagFilters
                    metricName={metricName}
                    onSelectTags={(t) => setFilters(t)}
                    currentTags={filters}
                />
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
                                    filters: filters,
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

const ChartContainer = React.memo(
    ({
        metricIdx,
        metricConfig,
        chartType,
        aggregator,
        maxGoodValue,
        maxNeedsImprovementValue,
        poorValue,
        showEditModal,
        dateRange,
        customDateRange,
        setMaxGoodValue,
        setMaxNeedsImprovementValue,
        setPoorValue,
        updateMetric,
        setShowEditModal,
        setShowDeleteModal,
        setDateRange,
    }: {
        metricIdx: number;
        metricConfig: DashboardMetricConfig;
        chartType: DashboardChartType;
        aggregator: MetricAggregator;
        maxGoodValue: number;
        maxNeedsImprovementValue: number;
        poorValue: number;
        showEditModal: boolean;
        dateRange: Props['dateRange'];
        customDateRange: Props['customDateRange'];
        setMaxGoodValue?: (v: number) => void;
        setMaxNeedsImprovementValue?: (v: number) => void;
        setPoorValue?: (v: number) => void;
        updateMetric: UpdateMetricFn;
        setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>;
        setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
        setDateRange: Props['setDateRange'];
    }) => {
        // TODO: See if we can do away with this entirely.
        const lookbackMinutes = moment
            .duration(
                moment(dateRange.end_date).diff(moment(dateRange.start_date))
            )
            .asMinutes();
        const NUM_BUCKETS = 60;
        const BUCKET_MINS = lookbackMinutes / NUM_BUCKETS;
        const TICK_EVERY_BUCKETS = 10;
        const { project_id } = useParams<{ project_id: string }>();
        const [referenceArea, setReferenceArea] = React.useState<{
            start: string;
            end: string;
        }>({ start: '', end: '' });
        const refetchInterval = useRef<number>();
        const resolutionMinutes = Math.ceil(lookbackMinutes / NUM_BUCKETS);
        const [
            loadTimeline,
            {
                data: timelineData,
                loading: timelineLoading,
                refetch: refetchTimeline,
            },
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
                    filters: metricConfig.filters,
                },
            },
            fetchPolicy: 'cache-first',
        });
        const [
            loadHistogram,
            {
                data: histogramData,
                loading: histogramLoading,
                refetch: refetchHistogram,
            },
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
                    filters: metricConfig.filters,
                },
            },
            fetchPolicy: 'cache-first',
        });

        useEffect(() => {
            if (chartType === DashboardChartType.Histogram) {
                if (refetchHistogram) {
                    refetchHistogram().catch(console.error);
                } else {
                    loadHistogram();
                }
            } else if (chartType === DashboardChartType.Timeline) {
                if (refetchTimeline) {
                    refetchTimeline().catch(console.error);
                } else {
                    loadTimeline();
                }
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [chartType, dateRange.start_date, dateRange.end_date]);

        useEffect(() => {
            if (refetchInterval.current) {
                window.clearInterval(refetchInterval.current);
            }

            // Stop polling once a user selects a custom range.
            if (customDateRange) {
                return;
            }

            const handler = () => {
                // this ensures that even for large time ranges data will only be cached
                // for up to 1 minutes (cache key is based on the arguments).
                const startDate = roundDate(moment(new Date()), 1);
                const endDate = roundDate(moment(new Date()), 1);

                setDateRange(
                    startDate.subtract(lookbackMinutes, 'minutes').format(),
                    endDate.format()
                );
            };

            if (!refetchInterval.current) {
                handler();
            }

            refetchInterval.current = window.setInterval(handler, 60000);

            // Refs could be cleaned up before the cleanup method is invoked.
            // Hook warnings said to assign to a var to ensure it's available.
            const interval = refetchInterval.current;
            return () => window.clearInterval(interval);

            // Only invoke on initialization and custom date range selection.
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [customDateRange?.value]);

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
                        syncId="dashboardChart"
                        data={(timelineData?.metrics_timeline || []).map(
                            (x) => ({
                                date: x?.date,
                                [x?.aggregator ||
                                MetricAggregator.Avg]: x?.value,
                            })
                        )}
                        referenceLines={referenceLines}
                        xAxisDataKeyName="date"
                        xAxisTickFormatter={(tickItem) =>
                            moment(tickItem).format(tickFormat)
                        }
                        xAxisProps={{
                            ticks: ticks,
                            domain: ['dataMin', 'dataMax'],
                            scale: 'point',
                            tickCount: ticks.length,
                            interval: 0, // show all ticks
                        }}
                        lineColorMapping={{
                            [MetricAggregator.Max]: 'var(--color-red-500)',
                            [MetricAggregator.P99]: 'var(--color-red-400)',
                            [MetricAggregator.P95]: 'var(--color-orange-500)',
                            [MetricAggregator.P90]: 'var(--color-orange-400)',
                            [MetricAggregator.P75]: 'var(--color-green-600)',
                            [MetricAggregator.P50]: 'var(--color-blue-400)',
                            [MetricAggregator.Avg]: 'var(--color-gray-400)',
                            [MetricAggregator.Count]: 'var(--color-green-500)',
                        }}
                        yAxisLabel={metricConfig.units}
                        referenceAreaProps={{
                            x1: referenceArea.start,
                            x2: referenceArea.end,
                        }}
                        onMouseDown={(e?: any) => {
                            e?.activeLabel &&
                                setReferenceArea({
                                    start: e.activeLabel,
                                    end: referenceArea.end,
                                });
                        }}
                        onMouseMove={(e?: any) => {
                            e?.activeLabel &&
                                referenceArea.start &&
                                setReferenceArea({
                                    start: referenceArea.start,
                                    end: e.activeLabel,
                                });
                        }}
                        onMouseUp={() => {
                            if (Object.values(referenceArea).includes('')) {
                                return;
                            }

                            const { start, end } = referenceArea;

                            if (end > start) {
                                setDateRange(start, end, true);
                            } else {
                                setDateRange(end, start, true);
                            }

                            setReferenceArea({ start: '', end: '' });
                        }}
                    />
                ) : null}
            </>
        );
    },
    (prevProps, nextProps) =>
        prevProps.showEditModal === nextProps.showEditModal &&
        prevProps.chartType === nextProps.chartType &&
        prevProps.aggregator === nextProps.aggregator &&
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
            nextProps.metricConfig.max_percentile &&
        _.isEqual(
            prevProps.metricConfig.filters,
            nextProps.metricConfig.filters
        ) &&
        _.isEqual(prevProps.dateRange, nextProps.dateRange)
);

export default DashboardCard;
