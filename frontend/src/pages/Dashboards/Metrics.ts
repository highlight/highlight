import {
	DashboardChartType,
	DashboardMetricConfig,
	MetricAggregator,
} from '@graph/schemas'
import { WEB_VITALS_CONFIGURATION } from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils'

export const LAYOUT_ROW_WIDTH = 12
export const LAYOUT_CHART_WIDTH = LAYOUT_ROW_WIDTH / 2
export const DEFAULT_SINGLE_LAYOUT = {
	w: LAYOUT_CHART_WIDTH,
	h: 3,
	x: 0,
	y: 0,
	i: '0',
	minW: 1,
	minH: 1,
	static: false,
}
export const DEFAULT_METRICS_LAYOUT = {
	lg: [
		DEFAULT_SINGLE_LAYOUT,
		{
			...DEFAULT_SINGLE_LAYOUT,
			x: 6,
			y: 0,
			i: '1',
		},
		{
			...DEFAULT_SINGLE_LAYOUT,
			x: 0,
			y: 2,
			i: '2',
		},
		{
			...DEFAULT_SINGLE_LAYOUT,
			x: 6,
			y: 2,
			i: '3',
		},
		{
			...DEFAULT_SINGLE_LAYOUT,
			x: 0,
			y: 4,
			i: '4',
		},
	],
}

export const getDefaultMetricConfig = (name: string): DashboardMetricConfig => {
	let cfg: DashboardMetricConfig | undefined = undefined
	if (WEB_VITALS_CONFIGURATION.hasOwnProperty(name.toUpperCase())) {
		cfg = WEB_VITALS_CONFIGURATION[name.toUpperCase()]
	}
	return {
		name: name,
		description: cfg?.description || '',
		help_article: cfg?.help_article || '',
		units: cfg?.units || '',
		max_good_value: cfg?.max_good_value || 10,
		max_needs_improvement_value: cfg?.max_needs_improvement_value || 100,
		poor_value: cfg?.poor_value || 1000,
		chart_type: DashboardChartType.Timeline,
		aggregator: MetricAggregator.P50,
	}
}
