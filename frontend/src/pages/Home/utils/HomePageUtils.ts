import {
	DashboardChartType,
	DashboardMetricConfig,
	MetricAggregator,
	MetricViewComponentType,
	Session,
} from '@graph/schemas'
import { getUserProperties } from '@pages/Sessions/SessionsFeedV3/MinimalSessionCard/utils/utils'

export const HOME_DASHBOARD_CONFIGURATION: {
	[key in string]: DashboardMetricConfig
} = {
	KeyPerformanceIndicators: {
		name: 'KeyPerformanceIndicators',
		description: 'Key App Visitor Metrics',
		component_type: MetricViewComponentType.KeyPerformanceGauge,
	},
	Sessions: {
		name: 'sessions',
		description: 'Sessions',
		chart_type: DashboardChartType.TimelineBar,
		aggregator: MetricAggregator.CountDistinctKey,
	},
	Errors: {
		name: 'errors',
		description: 'Errors',
		chart_type: DashboardChartType.TimelineBar,
		aggregator: MetricAggregator.Sum,
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
}

const LAYOUT_ROW_WIDTH = 12
const LAYOUT_CHART_WIDTH = LAYOUT_ROW_WIDTH / 4
const DEFAULT_SINGLE_LAYOUT = {
	w: LAYOUT_CHART_WIDTH,
	h: 4,
	x: 0,
	y: 0,
	i: '0',
	minW: 2,
	minH: 2,
	static: false,
}
export const DEFAULT_HOME_DASHBOARD_LAYOUT = {
	lg: [
		{
			...DEFAULT_SINGLE_LAYOUT,
			minW: 6,
			w: 6,
			h: 2,
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
}

export const getUserDisplayName = (record: {
	userProperties: Session['user_properties']
	identifier: string
	[key: string]: any
}): string => {
	const userProperties = getUserProperties(record.userProperties)

	return (
		userProperties.highlightDisplayName ||
		userProperties.email ||
		record.identifier ||
		'Unidentified'
	)
}
