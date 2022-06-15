import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import Button from '@components/Button/Button/Button';
import { StandardDropdown } from '@components/Dropdown/StandardDropdown/StandardDropdown';
import { DropdownIndicator } from '@components/DropdownIndicator/DropdownIndicator';
import HighlightGate from '@components/HighlightGate/HighlightGate';
import Modal from '@components/Modal/Modal';
import ModalBody from '@components/ModalBody/ModalBody';
import { useGetSuggestedMetricsQuery } from '@graph/hooks';
import {
    DashboardDefinition,
    DashboardMetricConfig,
    MetricType,
} from '@graph/schemas';
import { SingleValue } from '@highlight-run/react-select';
import AsyncSelect from '@highlight-run/react-select/async';
import PlusIcon from '@icons/PlusIcon';
import DashboardCard from '@pages/Dashboards/components/DashboardCard/DashboardCard';
import { useDashboardsContext } from '@pages/Dashboards/DashboardsContext/DashboardsContext';
import { DEFAULT_METRICS_LAYOUT } from '@pages/Dashboards/Metrics';
import { WEB_VITALS_CONFIGURATION } from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import { styleProps } from '@pages/Sessions/SessionsFeedV2/components/QuickSearch/QuickSearch';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import { useHistory } from 'react-router-dom';

import styles from './DashboardPage.module.scss';

const ResponsiveGridLayout = WidthProvider(Responsive);

const timeFilter = [
    { label: 'Last 24 hours', value: 2 },
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
    { label: 'This year', value: 30 * 12 },
] as const;

interface MetricOption {
    value: string;
    label: string;
}

const getDefaultMetricConfig = (name: string): DashboardMetricConfig => {
    let cfg: DashboardMetricConfig | undefined = undefined;
    if (WEB_VITALS_CONFIGURATION.hasOwnProperty(name.toUpperCase())) {
        cfg = WEB_VITALS_CONFIGURATION[name.toUpperCase()];
    }
    return {
        name: name,
        description: '',
        help_article: cfg?.help_article || '',
        units: cfg?.units || 'ms',
        max_good_value: cfg?.max_good_value || 10,
        max_needs_improvement_value: cfg?.max_needs_improvement_value || 100,
        poor_value: cfg?.poor_value || 1000,
        type: cfg?.type || MetricType.Frontend,
    };
};

const DashboardPage = () => {
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const { dashboards, updateDashboard } = useDashboardsContext();
    const [dateRangeLength, setDateRangeLength] = useState<number>(
        timeFilter[2].value
    );
    const [layout, setLayout] = useState<Layouts>(DEFAULT_METRICS_LAYOUT);
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [dashboard, setDashboard] = useState<DashboardDefinition>();

    useEffect(() => {
        const dashboard = dashboards.find((d) => d?.id === id);
        if (dashboard) {
            const name = dashboard.name || '';
            setDashboard(dashboard);
            setNewMetrics(dashboard.metrics);
            if (dashboard.layout?.length) {
                setLayout(JSON.parse(dashboard.layout));
            }
            history.replace({ state: { dashboardName: name } });
        }
    }, [dashboards, history, id]);

    const [, setNewMetrics] = useState<DashboardMetricConfig[]>([]);

    const pushNewMetricConfig = (nm: DashboardMetricConfig[]) => {
        const newPos = { ...layout.lg[0] };
        newPos.i = (nm.length - 1).toString();
        const l = { lg: [...layout.lg, newPos].slice(0, nm.length) };
        console.log('setting layout', { l });
        updateDashboard({
            id,
            metrics: nm,
            name: dashboard?.name || '',
            layout: JSON.stringify(l),
        });
    };

    if (!dashboard) {
        return null;
    }

    return (
        <>
            <AddMetricModal
                shown={isAdding}
                onAddNewMetric={(metricName) => {
                    if (!metricName?.length) return;
                    setNewMetrics((d) => {
                        const nm = [...d, getDefaultMetricConfig(metricName)];
                        pushNewMetricConfig(nm);
                        return nm;
                    });
                    setIsAdding(false);
                }}
                onCancel={() => {
                    setIsAdding(false);
                }}
            />
            <div className={styles.dateRangePickerContainer}>
                <HighlightGate>
                    <Button
                        trackingId="DashboardAddLayout"
                        type="ghost"
                        onClick={() => {
                            setIsAdding((prev) => !prev);
                        }}
                    >
                        Add
                        <PlusIcon style={{ marginLeft: '1em' }} />
                    </Button>
                    <Button
                        trackingId="DashboardEditLayout"
                        type="ghost"
                        onClick={() => {
                            setIsEditing((prev) => !prev);
                            if (isEditing && dashboard) {
                                updateDashboard({
                                    id: id,
                                    name: dashboard.name,
                                    metrics: dashboard.metrics,
                                    layout: JSON.stringify(layout),
                                });
                            }
                        }}
                    >
                        {isEditing ? 'Done' : 'Edit'}
                    </Button>
                </HighlightGate>
                <StandardDropdown
                    data={timeFilter}
                    defaultValue={timeFilter[2]}
                    onSelect={setDateRangeLength}
                    className={styles.dateRangePicker}
                />
            </div>
            <div className={classNames(styles.gridContainer, styles.isEditing)}>
                <ResponsiveGridLayout
                    layouts={layout}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    breakpoints={{
                        lg: 1200,
                        md: 996,
                        sm: 768,
                        xs: 480,
                        xxs: 0,
                    }}
                    isDraggable={isEditing}
                    isResizable={isEditing}
                    containerPadding={[0, 0]}
                    rowHeight={155}
                    resizeHandles={['se']}
                    onDragStop={(layout) => {
                        setLayout({
                            lg: layout,
                        });
                    }}
                    onResizeStop={(layout) => {
                        setLayout({
                            lg: layout,
                        });
                    }}
                    onResize={(layout) => {
                        setLayout({
                            lg: layout,
                        });
                    }}
                >
                    {dashboard.metrics.map((metric, index) => (
                        <div key={index.toString()}>
                            <DashboardCard
                                isEditing={isEditing}
                                metricIdx={index}
                                metricConfig={metric}
                                updateMetric={(
                                    idx: number,
                                    value: DashboardMetricConfig
                                ) => {
                                    const newMetrics = [...dashboard.metrics];
                                    newMetrics[idx] = {
                                        ...dashboard.metrics[idx],
                                        ...value,
                                    };
                                    pushNewMetricConfig(newMetrics);
                                }}
                                deleteMetric={(idx: number) => {
                                    const newMetrics = [...dashboard.metrics];
                                    newMetrics.splice(idx, 1);
                                    pushNewMetricConfig(newMetrics);
                                }}
                                key={metric.name}
                                dateRange={{
                                    startDate: moment(new Date())
                                        .subtract(dateRangeLength, 'days')
                                        .startOf('day')
                                        .toISOString(),
                                    endDate: moment(new Date())
                                        .endOf('day')
                                        .toISOString(),
                                }}
                            />
                        </div>
                    ))}
                </ResponsiveGridLayout>
            </div>
        </>
    );
};

const AddMetricModal = ({
    shown,
    onAddNewMetric,
    onCancel,
}: {
    shown: boolean;
    onAddNewMetric: (metricName: string) => void;
    onCancel: () => void;
}) => {
    const { project_id } = useParams<{ project_id: string }>();
    const [isTyping, setIsTyping] = useState(false);
    const [metricName, setMetricName] = useState('');
    const { loading, refetch } = useGetSuggestedMetricsQuery({
        variables: {
            project_id,
            prefix: '',
        },
    });

    const getValueOptions = (
        input: string,
        callback: (s: MetricOption[]) => void
    ) => {
        refetch({
            project_id,
            prefix: input,
        })?.then((fetched) => {
            setIsTyping(false);
            callback(
                fetched.data.suggested_metrics.map((s) => ({
                    label: s,
                    value: s,
                }))
            );
        });
    };

    // Ignore this so we have a consistent reference so debounce works.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadOptions = useMemo(() => _.debounce(getValueOptions, 100), []);

    return (
        <Modal visible={shown} onCancel={onCancel} title={'Add a Metric Chart'}>
            <ModalBody>
                <div className={styles.newMetric}>
                    <section className={styles.section}>
                        <div className={styles.container}>
                            <DropdownIndicator
                                height={26}
                                isLoading={loading || isTyping}
                            />
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
                                        <div
                                            className={
                                                styles.dropdownPlaceholder
                                            }
                                        ></div>
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
                                    if (newValue?.value) {
                                        setMetricName(newValue.value);
                                    }
                                }}
                                isLoading={loading}
                                isClearable={false}
                                value={{
                                    value: metricName,
                                    label: metricName,
                                }}
                                escapeClearsValue={true}
                                defaultOptions={Object.keys(
                                    WEB_VITALS_CONFIGURATION
                                ).map(
                                    (k) =>
                                        ({
                                            label: k,
                                            value: k,
                                        } as MetricOption)
                                )}
                                noOptionsMessage={({ inputValue }) =>
                                    !inputValue
                                        ? null
                                        : `No results for "${inputValue}"`
                                }
                                placeholder="Search for a metric..."
                                isSearchable
                                maxMenuHeight={500}
                            />
                        </div>
                        <Button
                            style={{
                                width: 90,
                                marginLeft: 'var(--size-medium)',
                            }}
                            trackingId={'AddNewMetric'}
                            onClick={() => {
                                onAddNewMetric(metricName);
                                setMetricName('');
                            }}
                        >
                            Add
                            <PlusIcon style={{ marginLeft: '1em' }} />
                        </Button>
                    </section>
                </div>
            </ModalBody>
        </Modal>
    );
};

export default DashboardPage;
