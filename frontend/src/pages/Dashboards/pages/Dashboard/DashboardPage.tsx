import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import Button from '@components/Button/Button/Button';
import { StandardDropdown } from '@components/Dropdown/StandardDropdown/StandardDropdown';
import { DropdownIndicator } from '@components/DropdownIndicator/DropdownIndicator';
import HighlightGate from '@components/HighlightGate/HighlightGate';
import Modal from '@components/Modal/Modal';
import ModalBody from '@components/ModalBody/ModalBody';
import { useGetSuggestedMetricsQuery } from '@graph/hooks';
import { DashboardDefinition, DashboardMetricConfig } from '@graph/schemas';
import { SingleValue } from '@highlight-run/react-select';
import AsyncSelect from '@highlight-run/react-select/async';
import PlusIcon from '@icons/PlusIcon';
import DashboardCard from '@pages/Dashboards/components/DashboardCard/DashboardCard';
import { useDashboardsContext } from '@pages/Dashboards/DashboardsContext/DashboardsContext';
import {
    DEFAULT_METRICS_LAYOUT,
    getDefaultMetricConfig,
} from '@pages/Dashboards/Metrics';
import { WEB_VITALS_CONFIGURATION } from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import { styleProps } from '@pages/Sessions/SessionsFeedV2/components/QuickSearch/QuickSearch';
import useLocalStorage from '@rehooks/local-storage';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import { useHistory } from 'react-router-dom';

import styles from './DashboardPage.module.scss';

const ResponsiveGridLayout = WidthProvider(Responsive);

export const timeFilter = [
    { label: 'Last 1 minute', value: 1 },
    { label: 'Last 15 minutes', value: 15 },
    { label: 'Last 1 hours', value: 60 },
    { label: 'Last 6 hours', value: 6 * 60 },
    { label: 'Last 24 hours', value: 24 * 60 },
    { label: 'Last 7 days', value: 7 * 24 * 60 },
    { label: 'Last 30 days', value: 30 * 24 * 60 },
] as { label: string; value: number }[];

interface MetricOption {
    value: string;
    label: string;
}

const DashboardPage = () => {
    const history = useHistory();
    const { project_id, id } = useParams<{ project_id: string; id: string }>();
    const {
        dashboards,
        updateDashboard,
        setDateRange,
        lookbackMinutes,
    } = useDashboardsContext();
    const initialDateRangeLength = timeFilter.find(
        (x) => x.value === lookbackMinutes
    );
    const [dateRangeLength, setDateRangeLength] = useLocalStorage(
        `highlight-dashboard-${project_id}-${id}-date-range-v2`,
        initialDateRangeLength
    );
    const [canSaveChanges, setCanSaveChanges] = useState<Boolean>(false);
    const [layout, setLayout] = useState<Layouts>(DEFAULT_METRICS_LAYOUT);
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

    useEffect(() => {
        if (dateRangeLength?.value) {
            const endDate = moment(new Date());
            const startDate = moment(new Date()).subtract(
                dateRangeLength.value,
                'minutes'
            );

            setDateRange(startDate.format(), endDate.format());
        }
    }, [dateRangeLength?.value]);

    const [, setNewMetrics] = useState<DashboardMetricConfig[]>([]);

    const pushNewMetricConfig = (nm: DashboardMetricConfig[]) => {
        const newPos = { ...layout.lg[0] };
        newPos.i = (nm.length - 1).toString();
        const l = { lg: [...layout.lg, newPos].slice(0, nm.length) };
        updateDashboard({
            id,
            metrics: nm,
            name: dashboard?.name || '',
            layout: JSON.stringify(l),
        });
    };

    const handleDashboardChange = (layout: ReactGridLayout.Layout[]) => {
        setLayout({ lg: layout });
        setCanSaveChanges(true);
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
                    <>
                        {canSaveChanges && (
                            <Button
                                trackingId="DashboardEditLayout"
                                type="primary"
                                onClick={() => {
                                    setCanSaveChanges(false);

                                    const newLayout = JSON.stringify(layout);

                                    if (
                                        dashboard &&
                                        newLayout !== dashboard.layout
                                    ) {
                                        updateDashboard({
                                            id: id,
                                            name: dashboard.name,
                                            metrics: dashboard.metrics,
                                            layout: newLayout,
                                        });
                                    }

                                    message.success(
                                        'Dashboard layout updated!',
                                        5
                                    );
                                }}
                            >
                                Save Changes
                            </Button>
                        )}
                    </>
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
                </HighlightGate>
                <StandardDropdown
                    data={timeFilter}
                    defaultValue={dateRangeLength}
                    onSelect={(value) => {
                        setDateRangeLength(
                            timeFilter.filter((x) => x.value === value)[0]
                        );
                    }}
                    className={styles.dateRangePicker}
                />
            </div>
            <div className={classNames(styles.gridContainer, styles.isEditing)}>
                <ResponsiveGridLayout
                    layouts={layout}
                    cols={{
                        lg: 12,
                        md: 10,
                        sm: 6,
                        xs: 4,
                        xxs: 2,
                    }}
                    breakpoints={{
                        lg: 1200,
                        md: 996,
                        sm: 768,
                        xs: 480,
                        xxs: 0,
                    }}
                    isDraggable
                    isResizable
                    containerPadding={[0, 0]}
                    rowHeight={155}
                    resizeHandles={['se']}
                    draggableHandle="[data-drag-handle]"
                    onDragStop={handleDashboardChange}
                    onResizeStop={handleDashboardChange}
                    onResize={handleDashboardChange}
                >
                    {dashboard.metrics.map((metric, index) => (
                        <div key={index.toString()}>
                            <DashboardCard
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
    const loadOptions = useMemo(() => _.debounce(getValueOptions, 500), []);

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
