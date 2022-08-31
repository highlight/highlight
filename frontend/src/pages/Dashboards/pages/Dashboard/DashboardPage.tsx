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
import { DashboardComponentCard } from '@pages/Dashboards/components/DashboardCard/DashboardComponentCard/DashboardComponentCard';
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
import React, { useEffect, useState } from 'react';
import { Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import { useHistory } from 'react-router-dom';

import styles from './DashboardPage.module.scss';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardPage = ({
    dashboardName,
    header,
    containerStyles,
}: {
    dashboardName?: string;
    header?: React.ReactNode;
    containerStyles?: React.CSSProperties;
}) => {
    const history = useHistory<{ dashboardName: string }>();
    const { id } = useParams<{ id: string }>();
    const { timeRange } = useDataTimeRange();
    const { dashboards, allAdmins, updateDashboard } = useDashboardsContext();
    const [canSaveChanges, setCanSaveChanges] = useState<boolean>(false);
    const [layout, setLayout] = useState<Layouts>({ lg: [] });
    const [persistedLayout, setPersistedLayout] = useState<Layouts>({ lg: [] });
    const [dashboard, setDashboard] = useState<DashboardDefinition>();

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

                                            const newLayout =
                                                JSON.stringify(layout);

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
                            <TimeRangePicker />
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
                                [styles.liveColored]: !timeRange.absolute,
                                [styles.absoluteColored]: timeRange.absolute,
                            })}
                        >
                            {timeRange.absolute ? ` Absolute` : ` Live`}
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
    containerStyles,
}: {
    dashboard: DashboardDefinition;
    updateDashboard: (dm: DashboardMetricConfig[], newLayout?: Layouts) => void;
    layout: Layouts;
    persistedLayout: Layouts;
    setLayout: React.Dispatch<React.SetStateAction<Layouts>>;
    setCanSaveChanges: React.Dispatch<React.SetStateAction<boolean>>;
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

const getDashboardsBreadcrumbNames = (suffixes: { [key: string]: string }) => {
    return (url: string) => {
        if (url.endsWith('/dashboards')) {
            return 'Dashboards';
        }

        return `${suffixes?.dashboardName}`;
    };
};

export default DashboardPage;
