import { DashboardMetricConfig, MetricViewComponentType } from '@graph/schemas';
import ActiveUsersTable from '@pages/Home/components/ActiveUsersTable/ActiveUsersTable';
import KeyPerformanceIndicators from '@pages/Home/components/KeyPerformanceIndicators/KeyPerformanceIndicators';
import RageClicksForProjectTable from '@pages/Home/components/RageClicksForProjectTable/RageClicksForProjectTable';
import ReferrersTable from '@pages/Home/components/ReferrersTable/ReferrersTable';
import TopRoutesTable from '@pages/Home/components/TopRoutesTable/TopRoutesTable';
import { ErrorCountGraph, SessionCountGraph } from '@pages/Home/HomePage';
import React from 'react';

// TODO(vkorolik) implement
export const DashboardComponentCard = ({
    metricIdx,
    metricConfig,
}: {
    metricIdx: number;
    metricConfig: DashboardMetricConfig;
}) => {
    const componentType = metricConfig.component_type;
    return (
        <>
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
                TopRoutesTable
            ) : null}
        </>
    );
};
