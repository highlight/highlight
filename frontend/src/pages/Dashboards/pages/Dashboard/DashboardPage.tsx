import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import Button from '@components/Button/Button/Button';
import { StandardDropdown } from '@components/Dropdown/StandardDropdown/StandardDropdown';
import HighlightGate from '@components/HighlightGate/HighlightGate';
import { DashboardDefinition } from '@graph/schemas';
import DashboardCard from '@pages/Dashboards/components/DashboardCard/DashboardCard';
import { useDashboardsContext } from '@pages/Dashboards/DashboardsContext/DashboardsContext';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
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

const DashboardPage = () => {
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const { dashboards, updateDashboard } = useDashboardsContext();
    const [dateRangeLength, setDateRangeLength] = useState<number>(
        timeFilter[2].value
    );
    const [layout, setLayout] = useState<Layouts>(DEFAULT_WEB_VITALS_LAYOUT);
    const [isEditing, setIsEditing] = useState(false);
    const [dashboard, setDashboard] = useState<DashboardDefinition>();

    useEffect(() => {
        const dashboard = dashboards.find((d) => d?.id === id);
        if (dashboard) {
            const name = dashboard.name || '';
            setDashboard(dashboard);
            if (dashboard.layout?.length) {
                setLayout(JSON.parse(dashboard.layout));
            }
            history.replace({ state: { dashboardName: name } });
        }
    }, [dashboards, history, id]);

    if (!dashboard) {
        return null;
    }

    return (
        <>
            <div className={styles.dateRangePickerContainer}>
                <HighlightGate>
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
                    resizeHandles={['e']}
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
                >
                    {dashboard.metrics.map((metric, index) => (
                        <div key={index.toString()}>
                            <DashboardCard
                                isEditing={isEditing}
                                metricConfig={metric}
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

export default DashboardPage;

const DEFAULT_WEB_VITALS_LAYOUT = {
    lg: [
        {
            w: 6,
            h: 2,
            x: 0,
            y: 0,
            i: '0',
            minW: 3,
            static: false,
        },
        {
            w: 6,
            h: 2,
            x: 6,
            y: 0,
            i: '1',
            minW: 3,
            static: false,
        },
        {
            w: 6,
            h: 2,
            x: 0,
            y: 2,
            i: '2',
            minW: 3,
            static: false,
        },
        {
            w: 6,
            h: 2,
            x: 6,
            y: 2,
            i: '3',
            minW: 3,
            static: false,
        },
        {
            w: 6,
            h: 2,
            x: 0,
            y: 4,
            i: '4',
            minW: 3,
            static: false,
        },
    ],
};
