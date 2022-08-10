import { DashboardMetricConfig, MetricViewComponentType } from '@graph/schemas';

export const HOME_DASHBOARD_CONFIGURATION: {
    [key in string]: DashboardMetricConfig;
} = {
    KeyPerformanceIndicators: {
        name: 'KeyPerformanceIndicators',
        description: 'Key App Visitor Metrics',
        component_type: MetricViewComponentType.KeyPerformanceGauge,
    },
    SessionsPerDay: {
        name: 'SessionsPerDay',
        description: 'Sessions per Day',
        component_type: MetricViewComponentType.SessionCountChart,
    },
    ErrorsPerDay: {
        name: 'ErrorsPerDay',
        description: 'Errors per Day',
        component_type: MetricViewComponentType.ErrorCountChart,
    },
    TopReferrers: {
        name: 'TopReferrers',
        description: 'Top Referrers',
        component_type: MetricViewComponentType.ReferrersTable,
    },
    TopUsers: {
        name: 'TopUsers',
        description: 'Top Users',
        component_type: MetricViewComponentType.ActiveUsersTable,
    },
    RageClicks: {
        name: 'RageClicks',
        description: 'Rage Clicks',
        component_type: MetricViewComponentType.RageClicksTable,
    },
    TopRoutes: {
        name: 'TopRoutes',
        description: 'Top Routes',
        component_type: MetricViewComponentType.TopRoutesTable,
    },
};

const LAYOUT_ROW_WIDTH = 12;
const LAYOUT_CHART_WIDTH = LAYOUT_ROW_WIDTH / 4;
const DEFAULT_SINGLE_LAYOUT = {
    w: LAYOUT_CHART_WIDTH,
    h: 3,
    x: 0,
    y: 0,
    i: '0',
    minW: 1,
    minH: 1,
    static: false,
};
export const DEFAULT_HOME_DASHBOARD_LAYOUT = {
    lg: [
        {
            ...DEFAULT_SINGLE_LAYOUT,
            w: 5,
            h: 1,
            x: 0,
            y: 0,
            i: '0',
        },
        {
            ...DEFAULT_SINGLE_LAYOUT,
            x: 0,
            y: 1,
            i: '1',
        },
        {
            ...DEFAULT_SINGLE_LAYOUT,
            x: 3,
            y: 1,
            i: '2',
        },
        {
            ...DEFAULT_SINGLE_LAYOUT,
            x: 6,
            y: 0,
            i: '3',
        },
        {
            ...DEFAULT_SINGLE_LAYOUT,
            x: 6,
            y: 3,
            i: '4',
        },
        {
            ...DEFAULT_SINGLE_LAYOUT,
            x: 9,
            y: 0,
            i: '5',
        },
        {
            ...DEFAULT_SINGLE_LAYOUT,
            x: 9,
            y: 3,
            i: '6',
        },
    ],
};
