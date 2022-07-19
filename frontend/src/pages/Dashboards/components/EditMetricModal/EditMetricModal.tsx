import Button from '@components/Button/Button/Button';
import { CardFormActionsContainer, CardSubHeader } from '@components/Card/Card';
import CardSelect from '@components/CardSelect/CardSelect';
import { StandardDropdown } from '@components/Dropdown/StandardDropdown/StandardDropdown';
import { DropdownIndicator } from '@components/DropdownIndicator/DropdownIndicator';
import Input from '@components/Input/Input';
import Modal from '@components/Modal/Modal';
import ModalBody from '@components/ModalBody/ModalBody';
import Switch from '@components/Switch/Switch';
import {
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
import SaveIcon from '@icons/SaveIcon';
import TrashIcon from '@icons/TrashIcon';
import { UNIT_OPTIONS } from '@pages/Dashboards/components/DashboardCard/DashboardCard';
import dashStyles from '@pages/Dashboards/pages/Dashboard/DashboardPage.module.scss';
import { styleProps } from '@pages/Sessions/SessionsFeedV2/components/QuickSearch/QuickSearch';
import { useParams } from '@util/react-router/useParams';
import { Form } from 'antd';
import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';

import styles from './EditMetricModal.module.scss';

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
                            <CardSelect
                                title="Time Series / Line"
                                description={`Time-based line graph that plots the values of the metric on the Y axis with time on the X axis. Use this if you want to see how values change over time.`}
                                descriptionClass={styles.typeSubheader}
                                isSelected={
                                    chartType === DashboardChartType.Timeline
                                }
                                onClick={() =>
                                    setChartType(DashboardChartType.Timeline)
                                }
                            />
                            <CardSelect
                                title="Distribution / Bar"
                                description={`Histogram of occurrences of different values. Use this if you want to visualize where the majority of the values lie and what are potential outliers.`}
                                descriptionClass={styles.typeSubheader}
                                isSelected={
                                    chartType === DashboardChartType.Histogram
                                }
                                onClick={() =>
                                    setChartType(DashboardChartType.Histogram)
                                }
                            />
                        </div>
                    </section>

                    {chartType === DashboardChartType.Timeline ? (
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
                                    </div>
                                    <div className={styles.metricViewDetail}>
                                        <h3>Maximum</h3>
                                    </div>
                                </div>
                            </section>
                        </>
                    ) : null}

                    <section className={styles.section}>
                        <h3>Filters</h3>
                        <TagFilters
                            metricName={metricName}
                            onSelectTags={(t) => setFilters(t)}
                            currentTags={filters}
                        />
                    </section>

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
                {chartType === DashboardChartType.Histogram && (
                    <section className={styles.section}>
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
            load().catch(console.error);
        }
    }, [tag, load]);

    return (
        <>
            {data?.metric_tags.length ? (
                <StandardDropdown
                    gray
                    placeholder={'graphql_operation'}
                    data={
                        data?.metric_tags
                            .filter((t) =>
                                usedTags ? !usedTags.includes(t) : true
                            )
                            .map((t) => ({
                                value: t,
                                label: t,
                            })) || []
                    }
                    defaultValue={value ? { value, label: value } : undefined}
                    onSelect={(v) => {
                        setTag(v);
                        setValue(undefined);
                    }}
                />
            ) : (
                <Input
                    placeholder="graphql_operation"
                    name="graphql_operation"
                    value={tag}
                    onChange={(e) => {
                        setTag(e.target.value);
                        setValue(undefined);
                    }}
                />
            )}
            {values?.metric_tag_values.length ? (
                <StandardDropdown
                    gray
                    placeholder={'GetSessions'}
                    data={
                        values?.metric_tag_values.map((t) => ({
                            value: t,
                            label: t,
                        })) || []
                    }
                    defaultValue={value ? { value, label: value } : undefined}
                    onSelect={(v) => {
                        setTag(v);
                        if (tag?.length) {
                            onSelectTag({ tag: tag, value: v });
                        }
                    }}
                />
            ) : (
                <Input
                    placeholder="GetSessions"
                    name="GetSessions"
                    value={value}
                    onChange={(e) => {
                        setTag(e.target.value);
                        if (tag?.length) {
                            onSelectTag({ tag: tag, value: e.target.value });
                        }
                    }}
                />
            )}
        </>
    );
};

interface MetricOption {
    value: string;
    label: string;
}

const MetricSelector = ({
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
                name={'graphql.operation.users'}
                autoFocus
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
