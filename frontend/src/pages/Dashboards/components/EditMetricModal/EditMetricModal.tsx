import Button from '@components/Button/Button/Button';
import { CardFormActionsContainer, CardSubHeader } from '@components/Card/Card';
import CardSelect from '@components/CardSelect/CardSelect';
import { StandardDropdown } from '@components/Dropdown/StandardDropdown/StandardDropdown';
import Input from '@components/Input/Input';
import Modal from '@components/Modal/Modal';
import ModalBody from '@components/ModalBody/ModalBody';
import {
    SearchOption,
    SearchSelect,
    SimpleSearchSelect,
} from '@components/Select/SearchSelect/SearchSelect';
import {
    useGetMetricTagsQuery,
    useGetMetricTagValuesLazyQuery,
    useGetSuggestedMetricsQuery,
} from '@graph/hooks';
import {
    DashboardChartType,
    DashboardMetricConfig,
    Maybe,
    MetricAggregator,
    MetricTagFilter,
    MetricTagFilterOp,
    MetricViewComponentType,
} from '@graph/schemas';
import SaveIcon from '@icons/SaveIcon';
import TrashIcon from '@icons/TrashIcon';
import { UNIT_OPTIONS } from '@pages/Dashboards/components/DashboardCard/DashboardCard';
import { useParams } from '@util/react-router/useParams';
import { Form } from 'antd';
import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';

import styles from './EditMetricModal.module.scss';

const CHART_TYPES = [
    {
        title: 'Time Series / Line',
        description: `Line graph that plots the values of the metric on the Y axis with time on the X axis. Use this if you want to see how values change over time.`,
        chartType: DashboardChartType.Timeline,
    },
    {
        title: 'Time Series / Bar',
        description: `Bar graph that plots the values of the metric on the Y axis with time on the X axis. Use this if you want to see how values change over time.`,
        chartType: DashboardChartType.TimelineBar,
    },
    {
        title: 'Distribution / Bar',
        description: `Histogram of occurrences of different values. Use this if you want to visualize where the majority of the values lie and view outliers.`,
        chartType: DashboardChartType.Histogram,
    },
    {
        title: 'Key Visitor Metrics',
        description: `Top metrics about visits to your app.`,
        componentType: MetricViewComponentType.KeyPerformanceGauge,
    },
    {
        title: 'Session Count',
        description: `Number of sessions over time.`,
        componentType: MetricViewComponentType.SessionCountChart,
    },
    {
        title: 'Error Count',
        description: `Number of errors over time.`,
        componentType: MetricViewComponentType.ErrorCountChart,
    },
    {
        title: 'App Referrers',
        description: `Top web referrers.`,
        componentType: MetricViewComponentType.ReferrersTable,
    },
    {
        title: 'Active Users',
        description: `Top identified users.`,
        componentType: MetricViewComponentType.ActiveUsersTable,
    },
    {
        title: 'Rage Clicks',
        description: `Instances of rage clicks.`,
        componentType: MetricViewComponentType.RageClicksTable,
    },
    {
        title: 'Top Routes',
        description: `Most accessed routes.`,
        componentType: MetricViewComponentType.TopRoutesTable,
    },
];

export type UpdateMetricFn = (
    idx: number,
    value: DashboardMetricConfig
) => void;
export const EditMetricModal = ({
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
    const [units, setUnits] = useState<string>(metricConfig.units || '');
    const [metricName, setMetricName] = useState<string>(metricConfig.name);
    const [description, setDescription] = useState<string>(
        metricConfig.description
    );
    const [componentType, setComponentType] = useState<
        Maybe<MetricViewComponentType> | undefined
    >(metricConfig.component_type);
    const [chartType, setChartType] = useState<
        Maybe<DashboardChartType> | undefined
    >(metricConfig.chart_type);
    const [aggregator, setAggregator] = useState<MetricAggregator>(
        metricConfig.aggregator || MetricAggregator.P50
    );
    const [filters, setFilters] = useState<MetricTagFilter[]>(
        metricConfig.filters || []
    );
    const [groups, setGroups] = useState<string[]>(metricConfig.groups || []);

    useEffect(() => {
        if (!metricConfig.component_type && !metricConfig.chart_type) {
            setChartType(DashboardChartType.Timeline);
        }
    }, [metricConfig.component_type, metricConfig.chart_type]);

    return (
        <Modal
            onCancel={onCancel}
            visible={shown}
            title={'Edit Metric View'}
            width="800px"
            mask
        >
            <ModalBody>
                <Form
                    onFinish={() => {
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
                            component_type: componentType,
                            aggregator,
                            filters,
                            groups,
                            ...(minValue
                                ? { min_value: min }
                                : { min_percentile: min / 100 }),
                            ...(maxValue
                                ? { max_value: max }
                                : { max_percentile: max / 100 }),
                        });
                        onCancel();
                    }}
                >
                    <section className={styles.section}>
                        <h3>Metric Name</h3>
                        <MetricSelector
                            onSelectMetric={setMetricName}
                            currentMetric={metricName}
                        />
                    </section>
                    <section className={styles.section}>
                        <h3>Metric View Title</h3>
                        <Input
                            placeholder="User Endpoint Latency"
                            name="User Endpoint Latency"
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                            }}
                            autoFocus
                        />
                    </section>

                    <section className={styles.section}>
                        <h3>Metric View Type</h3>
                        <div className={styles.typesContainer}>
                            {CHART_TYPES.map((c) => (
                                <CardSelect
                                    key={c.title}
                                    title={c.title}
                                    description={c.description}
                                    descriptionClass={styles.typeSubheader}
                                    isSelected={
                                        componentType
                                            ? componentType === c.componentType
                                            : chartType === c.chartType
                                    }
                                    onClick={() => {
                                        if (c.componentType) {
                                            setChartType(undefined);
                                            setComponentType(c.componentType);
                                        } else {
                                            setChartType(c.chartType);
                                            setComponentType(undefined);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </section>

                    {chartType === DashboardChartType.Timeline ||
                    chartType === DashboardChartType.TimelineBar ? (
                        <section className={styles.section}>
                            <div className={styles.metricViewDetails}>
                                <div className={styles.metricViewDetail}>
                                    <h3>Aggregator</h3>
                                    <StandardDropdown
                                        gray
                                        data={Object.values(
                                            MetricAggregator
                                        ).map((v) => ({
                                            label: v,
                                            value: v,
                                        }))}
                                        defaultValue={
                                            Object.values(MetricAggregator)
                                                .filter(
                                                    (x) =>
                                                        x ===
                                                        metricConfig.aggregator
                                                )
                                                .map((v) => ({
                                                    label: v,
                                                    value: v,
                                                }))[0]
                                        }
                                        onSelect={(value) =>
                                            setAggregator(value)
                                        }
                                    />
                                </div>
                                <div className={styles.metricViewDetail}>
                                    <h3>Units</h3>
                                    <UnitsSelector
                                        metricConfig={metricConfig}
                                        setUnits={setUnits}
                                    />
                                </div>
                            </div>
                        </section>
                    ) : chartType === DashboardChartType.Histogram ? (
                        <>
                            <section className={styles.section}>
                                <h3>Units</h3>
                                <UnitsSelector
                                    metricConfig={metricConfig}
                                    setUnits={setUnits}
                                />
                            </section>
                            <section className={styles.section}>
                                <CardSubHeader>
                                    Adjust the range of values included in the
                                    distribution.
                                </CardSubHeader>
                                <div className={styles.metricViewDetails}>
                                    <div className={styles.metricViewDetail}>
                                        <h3>Minimum</h3>
                                        <Input
                                            type={'text'}
                                            placeholder="Min"
                                            name="Min"
                                            value={minValue ? min : `${min}%`}
                                            min={minValue ? undefined : 0}
                                            max={minValue ? undefined : 100}
                                            onChange={(e) => {
                                                const v = e.target?.value;
                                                if (v.endsWith('%')) {
                                                    setMinValue(false);
                                                    setMin(
                                                        Number(
                                                            v.slice(0, -1)
                                                        ) || 0
                                                    );
                                                } else {
                                                    setMinValue(true);
                                                    setMin(Number(v) || 0);
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className={styles.metricViewDetail}>
                                        <h3>Maximum</h3>
                                        <Input
                                            type={'text'}
                                            placeholder="Max"
                                            name="Max"
                                            value={maxValue ? max : `${max}%`}
                                            min={maxValue ? undefined : 0}
                                            max={maxValue ? undefined : 100}
                                            onChange={(e) => {
                                                const v = e.target?.value;
                                                if (v.endsWith('%')) {
                                                    setMaxValue(false);
                                                    setMax(
                                                        Number(
                                                            v.slice(0, -1)
                                                        ) || 0
                                                    );
                                                } else {
                                                    setMaxValue(true);
                                                    setMax(Number(v) || 0);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </section>
                        </>
                    ) : null}

                    {chartType ? (
                        <section className={styles.section}>
                            <h3>Filter by</h3>
                            <TagFilters
                                metricName={metricName}
                                onSelectTags={(t) => setFilters(t)}
                                currentTags={filters}
                            />
                        </section>
                    ) : null}

                    {chartType === DashboardChartType.TimelineBar ? (
                        <section className={styles.section}>
                            <h3>Group by</h3>
                            <TagGroups
                                metricName={metricName}
                                onSelectGroups={(g) => setGroups(g)}
                                currentGroups={groups}
                            />
                        </section>
                    ) : null}

                    <CardFormActionsContainer>
                        <div className={styles.submitRow}>
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
                                trackingId={'DashboardCardDelete'}
                                onClick={onDelete}
                            >
                                Delete
                            </Button>
                            <Button
                                type={'primary'}
                                style={{
                                    width: 90,
                                }}
                                icon={
                                    <SaveIcon
                                        style={{
                                            marginRight: 'var(--size-xSmall)',
                                        }}
                                    />
                                }
                                trackingId={'SaveMetric'}
                                htmlType="submit"
                            >
                                Save
                            </Button>
                        </div>
                    </CardFormActionsContainer>
                </Form>
            </ModalBody>
        </Modal>
    );
};

const UnitsSelector = ({
    metricConfig,
    setUnits,
}: {
    metricConfig: DashboardMetricConfig;
    setUnits: React.Dispatch<React.SetStateAction<string>>;
}) => {
    return (
        <StandardDropdown
            gray
            data={UNIT_OPTIONS}
            defaultValue={
                UNIT_OPTIONS.filter((x) => x.value === metricConfig.units)[0]
            }
            onSelect={(value) => setUnits(value)}
        />
    );
};

export const TagGroups = ({
    metricName,
    onSelectGroups,
    currentGroups,
}: {
    metricName: string;
    onSelectGroups: (tags: string[]) => void;
    currentGroups: string[];
}) => {
    const { project_id } = useParams<{ project_id: string }>();
    const { data } = useGetMetricTagsQuery({
        variables: {
            project_id,
            metric_name: metricName,
        },
    });
    const currentGroup = currentGroups[0];
    return (
        <>
            <div className={styles.groupsRow} key={`tag-group-${currentGroup}`}>
                <SimpleSearchSelect
                    options={data?.metric_tags || []}
                    value={currentGroup}
                    onSelect={(v) => {
                        onSelectGroups([v]);
                    }}
                />
                <Button
                    trackingId={'EditMetricRemoveTagGroup'}
                    className={styles.removeTagFilterButton}
                    disabled={!currentGroup?.length}
                    onClick={() => {
                        onSelectGroups([]);
                    }}
                >
                    <TrashIcon />
                </Button>
            </div>
        </>
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
                <div
                    className={styles.tagFilterGroup}
                    key={`tag-filter-${v?.tag || idx}`}
                >
                    <div className={styles.filtersRow}>
                        <h5>Key</h5>
                        <h5>Value</h5>
                    </div>
                    <div
                        className={styles.filtersRow}
                        key={`tag-filter-${v?.tag || idx}`}
                    >
                        <TagFilterSelector
                            metricName={metricName}
                            onSelectTag={(t) => {
                                // ensure changing an existing tag updates rather than adding
                                const newTags = [];
                                let newTag = true;
                                for (const x of currentTags) {
                                    if (x.tag === t.tag) {
                                        newTag = false;
                                        newTags.push({
                                            tag: x.tag,
                                            op: t.op,
                                            value: t.value,
                                        } as MetricTagFilter);
                                    } else {
                                        newTags.push(x);
                                    }
                                }
                                if (newTag) {
                                    newTags.push(t);
                                }
                                onSelectTags(newTags);
                            }}
                            currentTag={v}
                            usedTags={currentTags.map((t) => t.tag)}
                        />
                        <Button
                            trackingId={'EditMetricRemoveTagFilter'}
                            className={styles.removeTagFilterButton}
                            disabled={idx >= currentTags.length}
                            onClick={() => {
                                onSelectTags(
                                    currentTags.filter((t) => t.tag !== v?.tag)
                                );
                            }}
                        >
                            <TrashIcon />
                        </Button>
                    </div>
                </div>
            ))}
        </>
    );
};

const OperatorOptions = [
    { label: 'equals', value: MetricTagFilterOp.Equals },
    { label: 'contains', value: MetricTagFilterOp.Contains },
];

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
    const [op, setOp] = useState<MetricTagFilterOp>(
        currentTag?.op || MetricTagFilterOp.Equals
    );
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
            <SimpleSearchSelect
                options={
                    data?.metric_tags.filter((t) =>
                        usedTags ? !usedTags.includes(t) : true
                    ) || []
                }
                value={tag}
                onSelect={(v) => {
                    setTag(v);
                    setValue(undefined);
                }}
            />
            <StandardDropdown
                gray
                data={OperatorOptions}
                defaultValue={OperatorOptions[0]}
                value={OperatorOptions.filter((o) => o.value == op)[0]}
                onSelect={(v) => {
                    setOp(v);
                    if (tag?.length && value?.length) {
                        onSelectTag({ tag, op: v, value });
                    }
                }}
            />
            <SimpleSearchSelect
                placeholder={'GetSession'}
                options={values?.metric_tag_values || []}
                value={value}
                freeSolo
                onSelect={(v) => {
                    setTag(v);
                    if (tag?.length) {
                        onSelectTag({ tag, op, value: v });
                    }
                }}
            />
        </>
    );
};

const MetricSelector = ({
    onSelectMetric,
    currentMetric,
}: {
    onSelectMetric: (metricName: string) => void;
    currentMetric?: string;
}) => {
    const { project_id } = useParams<{ project_id: string }>();
    const [options, setOptions] = useState<SearchOption[]>([]);
    const { data } = useGetSuggestedMetricsQuery({
        variables: {
            project_id,
            prefix: '',
        },
    });

    const getValueOptions = (input: string) => {
        setOptions(
            data?.suggested_metrics
                .filter(
                    (m) => m.toLowerCase().indexOf(input.toLowerCase()) !== -1
                )
                .map((s) => ({
                    label: s,
                    value: s,
                })) || []
        );
    };

    const loadOptions = useMemo(
        () => _.debounce(getValueOptions, 300),
        // Ignore this so we have a consistent reference so debounce works.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [data?.suggested_metrics]
    );

    // initial load of options
    useEffect(() => {
        if (!options.length && data?.suggested_metrics) {
            loadOptions('');
        }
    }, [loadOptions, options, data?.suggested_metrics]);

    return (
        <SearchSelect
            value={currentMetric}
            onSelect={onSelectMetric}
            options={options}
            loadOptions={loadOptions}
        />
    );
};
