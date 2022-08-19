import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import Breadcrumb from '@components/Breadcrumb/Breadcrumb';
import Button from '@components/Button/Button/Button';
import { StandardDropdown } from '@components/Dropdown/StandardDropdown/StandardDropdown';
import LeadAlignLayout from '@components/layout/LeadAlignLayout';
import {
    Admin,
    DashboardDefinition,
    DashboardMetricConfig,
} from '@graph/schemas';
import PlusIcon from '@icons/PlusIcon';
import AlertLastEditedBy from '@pages/Alerts/components/AlertLastEditedBy/AlertLastEditedBy';
import DashboardCard from '@pages/Dashboards/components/DashboardCard/DashboardCard';
import { DashboardComponentCard } from '@pages/Dashboards/components/DashboardCard/DashboardComponentCard/DashboardComponentCard';
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

const DashboardPage = ({
    dashboardName,
    lookbackDays,
    onChangeLookbackDays,
    header,
    containerStyles,
}: {
    dashboardName?: string;
    lookbackDays?: number;
    onChangeLookbackDays?: React.Dispatch<React.SetStateAction<number>>;
    header?: React.ReactNode;
    containerStyles?: React.CSSProperties;
}) => {
    const history = useHistory<{ dashboardName: string }>();
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
        start_date: (lookbackDays
            ? moment().subtract(lookbackDays, 'days')
            : moment().subtract(dateRangeLength.value, 'minutes')
        ).format(),
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

    const { dashboards, allAdmins, updateDashboard } = useDashboardsContext();
    const [canSaveChanges, setCanSaveChanges] = useState<boolean>(false);
    const [layout, setLayout] = useState<Layouts>({ lg: [] });
    const [persistedLayout, setPersistedLayout] = useState<Layouts>({ lg: [] });
    const [dashboard, setDashboard] = useState<DashboardDefinition>();

    useEffect(() => {
        if (onChangeLookbackDays) {
            onChangeLookbackDays(
                Math.round(
                    moment
                        .duration(
                            moment(dateRange.end_date).diff(
                                moment(dateRange.start_date)
                            )
                        )
                        .asDays()
                )
            );
        }
    }, [onChangeLookbackDays, dateRange]);

    useEffect(() => {
        const dashboard = dashboards.find((d) =>
            dashboardName ? d?.name === dashboardName : d?.id === id
        );
        if (dashboard) {
            const name = dashboard.name || '';
            setDashboard(dashboard);
            setNewMetrics(dashboard.metrics);
            if (dashboard.layout?.length) {
                const parsedLayout = JSON.parse(dashboard.layout);
                setLayout(parsedLayout);
                setPersistedLayout(parsedLayout);
            }
            history.replace({ state: { dashboardName: name } });
        }
    }, [dashboardName, dashboards, history, id]);

    const [, setNewMetrics] = useState<DashboardMetricConfig[]>([]);

    const pushNewMetricConfig = (
        nm: DashboardMetricConfig[],
        newLayout?: Layouts
    ) => {
        let l: Layouts;
        if (newLayout) {
            l = newLayout;
        } else {
            const newPos = { ...DEFAULT_SINGLE_LAYOUT };
            newPos.i = (nm.length - 1).toString();
            newPos.y = Math.max(...layout.lg.map((l) => l.y));
            newPos.x =
                Math.max(
                    ...layout.lg.filter((l) => l.y === newPos.y).map((l) => l.x)
                ) + LAYOUT_CHART_WIDTH;
            // wrap in case we can't fit on this current row
            if (newPos.x > LAYOUT_ROW_WIDTH - LAYOUT_CHART_WIDTH) {
                newPos.y += 1;
                newPos.x = 0;
            }
            l = {
                lg: [...layout.lg, newPos].slice(0, nm.length),
            };
        }
        updateDashboard({
            id: dashboard?.id || id,
            metrics: nm,
            name: dashboard?.name || '',
            layout: JSON.stringify(l),
        });
    };

    if (!dashboard) {
        return null;
    }

    return (
        <LeadAlignLayout fullWidth className={styles.customLeadAlignLayout}>
            <div className={styles.dashboardPageFixedHeader}>
                <div className={styles.headerPanel}>
                    {header ? (
                        header
                    ) : (
                        <div>
                            <Breadcrumb
                                getBreadcrumbName={(url) =>
                                    getDashboardsBreadcrumbNames(
                                        history.location.state
                                    )(url)
                                }
                                linkRenderAs="h2"
                            />
                        </div>
                    )}
                    <div className={styles.rightControllerSection}>
                        <div className={styles.dateRangePickerContainer}>
                            <>
                                {canSaveChanges && (
                                    <Button
                                        trackingId="DashboardEditLayout"
                                        type="primary"
                                        onClick={() => {
                                            setCanSaveChanges(false);

                                            const newLayout = JSON.stringify(
                                                layout
                                            );

                                            updateDashboard({
                                                id: dashboard.id || id,
                                                name: dashboard.name,
                                                metrics: dashboard.metrics,
                                                layout: newLayout,
                                            });

                                            setPersistedLayout(layout);

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
                                        const nm = [
                                            ...d,
                                            getDefaultMetricConfig(''),
                                        ];
                                        pushNewMetricConfig(nm);
                                        return nm;
                                    });
                                }}
                            >
                                Add
                                <PlusIcon
                                    style={{
                                        marginLeft: '1em',
                                        marginBottom: '0.1em',
                                    }}
                                />
                            </Button>
                            <StandardDropdown
                                data={
                                    customDateRange
                                        ? [customDateRange, ...timeFilters]
                                        : timeFilters
                                }
                                value={customDateRange || dateRangeLength}
                                onSelect={(value) => {
                                    const endDate = moment(new Date());
                                    const startDate = moment(
                                        new Date()
                                    ).subtract(value, 'minutes');

                                    updateDateRange(
                                        startDate.format(),
                                        endDate.format()
                                    );
                                    setDateRangeLength(
                                        timeFilters.filter(
                                            (f) => f.value === value
                                        )[0]
                                    );
                                }}
                                className={styles.dateRangePicker}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.headerPanel}>
                    <div>
                        {dashboard.last_admin_to_edit_id && (
                            <AlertLastEditedBy
                                adminId={dashboard.last_admin_to_edit_id.toString()}
                                lastEditedTimestamp={dashboard.updated_at}
                                allAdmins={
                                    allAdmins.filter((a) => a) as Admin[]
                                }
                                loading={false}
                            />
                        )}
                    </div>
                    <div className={styles.rightControllerText}>
                        Results are{' '}
                        <span
                            className={classNames({
                                [styles.liveColored]: !customDateRange,
                                [styles.absoluteColored]: customDateRange,
                            })}
                        >
                            {customDateRange ? ` Absolute` : ` Live`}
                        </span>
                    </div>
                </div>
            </div>
            <DashboardGrid
                dashboard={dashboard}
                updateDashboard={pushNewMetricConfig}
                layout={layout}
                persistedLayout={persistedLayout}
                setLayout={setLayout}
                setCanSaveChanges={setCanSaveChanges}
                dateRange={dateRange}
                updateDateRange={updateDateRange}
                customDateRange={customDateRange}
                containerStyles={containerStyles}
            />
        </LeadAlignLayout>
    );
};

export const DashboardGrid = ({
    dashboard,
    updateDashboard,
    layout,
    persistedLayout,
    setLayout,
    setCanSaveChanges,
    dateRange,
    updateDateRange,
    customDateRange,
    containerStyles,
}: {
    dashboard: DashboardDefinition;
    updateDashboard: (dm: DashboardMetricConfig[], newLayout?: Layouts) => void;
    layout: Layouts;
    persistedLayout: Layouts;
    setLayout: React.Dispatch<React.SetStateAction<Layouts>>;
    setCanSaveChanges: React.Dispatch<React.SetStateAction<boolean>>;
    dateRange: { start_date: string; end_date: string };
    updateDateRange: (start: string, end: string, custom?: boolean) => void;
    customDateRange?: { label: string; value: number };
    containerStyles?: React.CSSProperties;
}) => {
    const handleDashboardChange = (newLayout: ReactGridLayout.Layout[]) => {
        setLayout({ lg: newLayout });

        const newLayoutJSON = JSON.stringify(newLayout);
        const layoutJSON = JSON.stringify(persistedLayout.lg);
        setCanSaveChanges(layoutJSON !== newLayoutJSON);
    };

    const updateMetric = (idx: number, value: DashboardMetricConfig) => {
        const newMetrics = [...dashboard.metrics];
        newMetrics[idx] = {
            ...dashboard.metrics[idx],
            ...value,
        };
        updateDashboard(newMetrics);
    };

    const deleteMetric = (idx: number) => {
        const newMetrics = [...dashboard.metrics];
        newMetrics.splice(idx, 1);
        const lgLayout = [...layout.lg];
        lgLayout.splice(idx, 1);
        // reset new layout idxes because they should be incrementing
        const newLgLayout = [];
        for (let i = 0; i < lgLayout.length; i++) {
            newLgLayout.push({
                ...lgLayout[i],
                i: i.toString(),
            });
        }
        updateDashboard(newMetrics, {
            lg: newLgLayout,
        });
    };

    return (
        <div
            className={classNames(styles.gridContainer, styles.isEditing)}
            style={containerStyles}
        >
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
                    lg: 1600,
                    md: 1330,
                    sm: 920,
                    xs: 768,
                    xxs: 480,
                }}
                isDraggable
                isResizable
                containerPadding={[0, 0]}
                rowHeight={115}
                resizeHandles={['se']}
                draggableHandle="[data-drag-handle]"
                onDragStop={handleDashboardChange}
                onResizeStop={handleDashboardChange}
            >
                {dashboard.metrics.map((metric, index) => (
                    <div key={index.toString()}>
                        {!metric.component_type ? (
                            <DashboardCard
                                metricIdx={index}
                                metricConfig={metric}
                                updateMetric={updateMetric}
                                deleteMetric={deleteMetric}
                                key={metric.name}
                                customDateRange={customDateRange}
                                dateRange={dateRange}
                                setDateRange={updateDateRange}
                            />
                        ) : (
                            <DashboardComponentCard
                                metricIdx={index}
                                metricConfig={metric}
                                updateMetric={updateMetric}
                                deleteMetric={deleteMetric}
                            />
                        )}
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    );
};

export const roundDate = (d: moment.Moment, toMinutes: number) => {
    if (toMinutes <= 1) {
        return moment(d.format('YYYY-MM-DDTHH:mm:00.000000000Z'));
    }
    const remainder = toMinutes - (d.minute() % toMinutes);
    return d.add(remainder, 'minutes');
};

const getDashboardsBreadcrumbNames = (suffixes: { [key: string]: string }) => {
    return (url: string) => {
        if (url.endsWith('/dashboards')) {
            return 'Dashboards';
        }

        return `${suffixes?.dashboardName}`;
    };
};

export default DashboardPage;
