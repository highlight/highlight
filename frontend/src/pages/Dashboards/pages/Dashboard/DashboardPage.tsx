import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import Button from '@components/Button/Button/Button';
import { StandardDropdown } from '@components/Dropdown/StandardDropdown/StandardDropdown';
import HighlightGate from '@components/HighlightGate/HighlightGate';
import { DashboardDefinition, DashboardMetricConfig } from '@graph/schemas';
import PlusIcon from '@icons/PlusIcon';
import DashboardCard from '@pages/Dashboards/components/DashboardCard/DashboardCard';
import { useDashboardsContext } from '@pages/Dashboards/DashboardsContext/DashboardsContext';
import { timeFilters } from '@pages/Dashboards/DashboardsRouter';
import {
    DEFAULT_SINGLE_LAYOUT,
    getDefaultMetricConfig,
    LAYOUT_CHART_WIDTH,
    LAYOUT_ROW_WIDTH,
} from '@pages/Dashboards/Metrics';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import { useHistory } from 'react-router-dom';

import styles from './DashboardPage.module.scss';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Range selection logic:
// - By default, get the value from localStorage and assign that
const DashboardPage = () => {
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const {
        dashboards,
        updateDashboard,
        dateRange,
        setDateRange,
        getLookbackMinutes,
        setDateRangeLength,
    } = useDashboardsContext();
    const [selectedFilter, setSelectedFilter] = React.useState<{
        label: string;
        value: number;
    }>();
    const [canSaveChanges, setCanSaveChanges] = useState<Boolean>(false);
    const [layout, setLayout] = useState<Layouts>({ lg: [] });
    const [dashboard, setDashboard] = useState<DashboardDefinition>();

    useEffect(() => {
        if (dateRange.custom) {
            const filter = {
                label: `${moment(dateRange.start_date).format(
                    'MMM D, LT'
                )} - ${moment(dateRange.end_date).format('MMM D, LT')}`,
                value: getLookbackMinutes(),
            };

            setSelectedFilter(filter);
        }

        // Only want this invoked when the date range is updated.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange.custom]);

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
        const newPos = { ...DEFAULT_SINGLE_LAYOUT };
        newPos.i = (nm.length - 1).toString();
        newPos.x = ((nm.length - 1) * LAYOUT_CHART_WIDTH) % LAYOUT_ROW_WIDTH;
        newPos.y = Math.floor(
            ((nm.length - 1) * LAYOUT_CHART_WIDTH) / LAYOUT_ROW_WIDTH
        );
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
                            setNewMetrics((d) => {
                                const nm = [...d, getDefaultMetricConfig('')];
                                pushNewMetricConfig(nm);
                                return nm;
                            });
                        }}
                    >
                        Add
                        <PlusIcon style={{ marginLeft: '1em' }} />
                    </Button>
                </HighlightGate>
                <StandardDropdown
                    data={
                        selectedFilter
                            ? [selectedFilter, ...timeFilters]
                            : timeFilters
                    }
                    defaultValue={selectedFilter}
                    onSelect={(value) => {
                        const endDate = moment(new Date());
                        const startDate = moment(new Date()).subtract(
                            value,
                            'minutes'
                        );

                        setDateRange(
                            startDate.format(),
                            endDate.format(),
                            false
                        );

                        const selected = timeFilters.filter(
                            (f) => f.value === value
                        )[0];

                        setSelectedFilter(selected);
                        setDateRangeLength(selected);
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

export default DashboardPage;
