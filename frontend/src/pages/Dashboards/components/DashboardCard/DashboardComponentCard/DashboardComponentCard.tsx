import { DashboardMetricConfig, MetricViewComponentType } from '@graph/schemas';
import SvgDragIcon from '@icons/DragIcon';
import EditIcon from '@icons/EditIcon';
import {
    DeleteMetricFn,
    DeleteMetricModal,
} from '@pages/Dashboards/components/DashboardCard/DashboardCard';
import styles from '@pages/Dashboards/components/DashboardCard/DashboardCard.module.scss';
import {
    EditMetricModal,
    UpdateMetricFn,
} from '@pages/Dashboards/components/EditMetricModal/EditMetricModal';
import ActiveUsersTable from '@pages/Home/components/ActiveUsersTable/ActiveUsersTable';
import KeyPerformanceIndicators from '@pages/Home/components/KeyPerformanceIndicators/KeyPerformanceIndicators';
import RageClicksForProjectTable from '@pages/Home/components/RageClicksForProjectTable/RageClicksForProjectTable';
import ReferrersTable from '@pages/Home/components/ReferrersTable/ReferrersTable';
import TopRoutesTable from '@pages/Home/components/TopRoutesTable/TopRoutesTable';
import {
    ErrorCountGraph,
    SessionCountGraph,
} from '@pages/Home/utils/HomeCharts';
import classNames from 'classnames';
import React, { useState } from 'react';

export const DashboardComponentCard = ({
    metricIdx,
    metricConfig,
    updateMetric,
    deleteMetric,
}: {
    metricIdx: number;
    metricConfig: DashboardMetricConfig;
    updateMetric: UpdateMetricFn;
    deleteMetric: DeleteMetricFn;
}) => {
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const componentType = metricConfig.component_type;
    return (
        <div className={classNames(styles.card, styles.componentCard)}>
            <EditMetricModal
                shown={showEditModal}
                onCancel={() => {
                    setShowEditModal(false);
                }}
                onDelete={() => {
                    setShowDeleteModal(true);
                }}
                metricConfig={metricConfig}
                metricIdx={metricIdx}
                updateMetric={updateMetric}
            />
            <DeleteMetricModal
                name={metricConfig.name}
                showDeleteModal={showDeleteModal}
                onDelete={() => {
                    setShowDeleteModal(false);
                    setShowEditModal(false);
                    deleteMetric(metricIdx);
                }}
                onCancel={() => {
                    setShowDeleteModal(false);
                }}
            />
            <EditIcon
                className={classNames(styles.overlayButton)}
                style={{
                    marginRight: 'var(--size-xSmall)',
                }}
                onClick={() => {
                    setShowEditModal(true);
                }}
            />
            <div
                className={classNames(
                    styles.draggable,
                    styles.draggableOverlay
                )}
                data-drag-handle=""
            >
                <SvgDragIcon />
            </div>
            {componentType === MetricViewComponentType.KeyPerformanceGauge ? (
                <KeyPerformanceIndicators />
            ) : componentType === MetricViewComponentType.SessionCountChart ? (
                <SessionCountGraph />
            ) : componentType === MetricViewComponentType.ErrorCountChart ? (
                <ErrorCountGraph />
            ) : componentType === MetricViewComponentType.ReferrersTable ? (
                <ReferrersTable />
            ) : componentType === MetricViewComponentType.ActiveUsersTable ? (
                <ActiveUsersTable />
            ) : componentType === MetricViewComponentType.RageClicksTable ? (
                <RageClicksForProjectTable />
            ) : componentType === MetricViewComponentType.TopRoutesTable ? (
                <TopRoutesTable />
            ) : null}
        </div>
    );
};
