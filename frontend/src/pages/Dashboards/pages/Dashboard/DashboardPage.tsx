import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import Button from '@components/Button/Button/Button';
import { StandardDropdown } from '@components/Dropdown/StandardDropdown/StandardDropdown';
import HighlightGate from '@components/HighlightGate/HighlightGate';
import { DashboardDefinition, DashboardMetricConfig } from '@graph/schemas';
import PlusIcon from '@icons/PlusIcon';
import DashboardCard from '@pages/Dashboards/components/DashboardCard/DashboardCard';
import { useDashboardsContext } from '@pages/Dashboards/DashboardsContext/DashboardsContext';
import {
    DEFAULT_SINGLE_LAYOUT,
    getDefaultMetricConfig,
    LAYOUT_CHART_WIDTH,
    LAYOUT_ROW_WIDTH,
} from '@pages/Dashboards/Metrics';
import useLocalStorage from '@rehooks/local-storage';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import { useHistory } from 'react-router-dom';

import styles from './DashboardPage.module.scss';

const ResponsiveGridLayout = WidthProvider(Responsive);

const timeFilters = [
    { label: 'Last 5 minutes', value: 5 },
    { label: 'Last 15 minutes', value: 15 },
    { label: 'Last 1 hours', value: 60 },
    { label: 'Last 6 hours', value: 6 * 60 },
    { label: 'Last 24 hours', value: 24 * 60 },
    { label: 'Last 7 days', value: 7 * 24 * 60 },
    { label: 'Last 30 days', value: 30 * 24 * 60 },
] as { label: string; value: number }[];

const DashboardPage = () => {
    const history = useHistory();
    const { project_id, id } = useParams<{ project_id: string; id: string }>();
    const [dateRangeLength, setDateRangeLength] = useLocalStorage(
        `highlight-dashboard-${project_id}-${id}-date-range-v2`,
        timeFilters[1]
    );
    const [customDateRange, setCustomDateRange] = React.useState<{
        label: string;
        value: number;
    }>();
    const [dateRange, setDateRange] = React.useState<{
        start_date: string;
        end_date: string;
    }>({
        start_date: moment()
            .subtract(dateRangeLength.value, 'minutes')
            .format(),
        end_date: moment().format(),
    });

    const updateDateRange = (start: string, end: string, custom = false) => {
        const startDate = moment(start);
        const endDate = moment(end);
        const minutesDiff = moment
            .duration(endDate.diff(startDate))
            .asMinutes();

        const roundedEnd = roundDate(endDate, Math.min(1, minutesDiff));
        const roundedStart = roundDate(startDate, Math.min(1, minutesDiff));

        if (custom) {
            const customDateRange = {
                label: `${startDate.format('MMM D, LT')} - ${endDate.format(
                    'MMM D, LT'
                )}`,
                value: 0,
            };

            setCustomDateRange(customDateRange);
        } else {
            setCustomDateRange(undefined);
        }

        setDateRange({
            start_date: moment(roundedStart).format(
                'YYYY-MM-DDTHH:mm:00.000000000Z'
            ),
            end_date: roundedEnd.format('YYYY-MM-DDTHH:mm:59.999999999Z'),
        });
    };

    const { dashboards, updateDashboard } = useDashboardsContext();
    const [canSaveChanges, setCanSaveChanges] = useState<Boolean>(false);
    const [layout, setLayout] = useState<Layouts>({ lg: [] });
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
                        customDateRange
                            ? [customDateRange, ...timeFilters]
                            : timeFilters
                    }
                    defaultValue={customDateRange || dateRangeLength}
                    onSelect={(value) => {
                        const endDate = moment(new Date());
                        const startDate = moment(new Date()).subtract(
                            value,
                            'minutes'
                        );

                        updateDateRange(startDate.format(), endDate.format());
                        setDateRangeLength(
                            timeFilters.filter((f) => f.value === value)[0]
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
                                customDateRange={customDateRange}
                                dateRange={dateRange}
                                setDateRange={updateDateRange}
                            />
                        </div>
                    ))}
                </ResponsiveGridLayout>
            </div>
        </>
    );
};

export const roundDate = (d: moment.Moment, toMinutes: number) => {
    const remainder = toMinutes - (d.minute() % toMinutes);
    return d.add(remainder, 'minutes');
};

export default DashboardPage;
