import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import Breadcrumb from '@components/Breadcrumb/Breadcrumb';
import Button from '@components/Button/Button/Button';
import LeadAlignLayout from '@components/layout/LeadAlignLayout';
import TimeRangePicker from '@components/TimeRangePicker/TimeRangePicker';
import {
    Admin,
    DashboardDefinition,
    DashboardMetricConfig,
} from '@graph/schemas';
import useDataTimeRange from '@hooks/useDataTimeRange';
import PlusIcon from '@icons/PlusIcon';
import AlertLastEditedBy from '@pages/Alerts/components/AlertLastEditedBy/AlertLastEditedBy';
import DashboardCard from '@pages/Dashboards/components/DashboardCard/DashboardCard';
import { useDashboardsContext } from '@pages/Dashboards/DashboardsContext/DashboardsContext';
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

const DashboardPage = () => {
    const history = useHistory<{ dashboardName: string }>();
    const { id } = useParams<{ project_id: string; id: string }>();
    const { timeRange: dateRange } = useDataTimeRange();

    const { dashboards, allAdmins, updateDashboard } = useDashboardsContext();
    const [canSaveChanges, setCanSaveChanges] = useState<Boolean>(false);
    const [layout, setLayout] = useState<Layouts>({ lg: [] });
    const [persistedLayout, setPersistedLayout] = useState<Layouts>({ lg: [] });
    const [dashboard, setDashboard] = useState<DashboardDefinition>();

    useEffect(() => {
        const dashboard = dashboards.find((d) => d?.id === id);
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

    const handleDashboardChange = (newLayout: ReactGridLayout.Layout[]) => {
        setLayout({ lg: newLayout });

        const newLayoutJSON = JSON.stringify(newLayout);
        const layoutJSON = JSON.stringify(persistedLayout.lg);
        setCanSaveChanges(layoutJSON !== newLayoutJSON);
    };

    if (!dashboard) {
        return null;
    }

    return (
        <LeadAlignLayout fullWidth className={styles.customLeadAlignLayout}>
            <div className={styles.dashboardPageFixedHeader}>
                <div className={styles.headerPanel}>
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
                                                id: id,
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
                            <TimeRangePicker />
                            {/* <StandardDropdown
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
                            /> */}
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
                                [styles.liveColored]: !dateRange.absolute,
                                [styles.absoluteColored]: dateRange.absolute,
                            })}
                        >
                            {dateRange.absolute ? ` Absolute` : ` Live`}
                        </span>
                    </div>
                </div>
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
                        lg: 920,
                        md: 900,
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
        </LeadAlignLayout>
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
