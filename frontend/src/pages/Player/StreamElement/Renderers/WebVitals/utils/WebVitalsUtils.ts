import {
	DashboardChartType,
	DashboardMetricConfig,
	MetricAggregator,
} from '@graph/schemas'

export enum WebVitalName {
	CLS = 'Cumulative Layout Shift',
	FCP = 'First Contentful Paint',
	FID = 'First Input Delay',
	LCP = 'Largest Contentful Paint',
	TTFB = 'Time to First Byte',
	INP = 'Interaction to Next Paint',
}

export const WEB_VITALS_CONFIGURATION: {
	[key in string]: DashboardMetricConfig
} = {
	CLS: {
		max_good_value: 0.1,
		name: 'CLS',
		description: WebVitalName.CLS,
		max_needs_improvement_value: 0.25,
		poor_value: 0,
		units: 'LS',
		help_article: 'https://web.dev/cls',
		chart_type: DashboardChartType.Timeline,
		aggregator: MetricAggregator.P50,
	},
	FID: {
		max_good_value: 100,
		name: 'FID',
		description: WebVitalName.FID,
		max_needs_improvement_value: 300,
		poor_value: 0,
		units: 'ms',
		help_article: 'https://web.dev/fid',
		chart_type: DashboardChartType.Timeline,
		aggregator: MetricAggregator.P50,
	},
	LCP: {
		max_good_value: 2500,
		name: 'LCP',
		description: WebVitalName.LCP,
		max_needs_improvement_value: 4000,
		poor_value: 0,
		units: 'ms',
		help_article: 'https://web.dev/lcp',
		chart_type: DashboardChartType.Timeline,
		aggregator: MetricAggregator.P50,
	},
	FCP: {
		max_good_value: 1800,
		name: 'FCP',
		description: WebVitalName.FCP,
		max_needs_improvement_value: 3000,
		poor_value: 0,
		units: 'ms',
		help_article: 'https://web.dev/fcp',
		chart_type: DashboardChartType.Timeline,
		aggregator: MetricAggregator.P50,
	},
	TTFB: {
		max_good_value: 500,
		name: 'TTFB',
		description: WebVitalName.TTFB,
		max_needs_improvement_value: 3000,
		poor_value: 0,
		units: 'ms',
		help_article: 'https://web.dev/ttfb',
		chart_type: DashboardChartType.Timeline,
		aggregator: MetricAggregator.P50,
	},
	INP: {
		max_good_value: 200,
		name: 'INP',
		description: WebVitalName.INP,
		max_needs_improvement_value: 500,
		poor_value: 0,
		units: 'ms',
		help_article: 'https://web.dev/inp',
		chart_type: DashboardChartType.Timeline,
		aggregator: MetricAggregator.P50,
	},
}

export const FRONTEND_OBSERVABILITY_CONFIGURATION: {
	[key in string]: DashboardMetricConfig
} = {
	latency: {
		max_good_value: 1,
		name: 'latency',
		description: 'Network Request Latency',
		max_needs_improvement_value: 2.5,
		poor_value: 0,
		units: 'ms',
		chart_type: DashboardChartType.Timeline,
		aggregator: MetricAggregator.P90,
	},
	requestSize: {
		name: 'body_size',
		description: 'Network Request Size',
		units: 'kb',
		chart_type: DashboardChartType.TimelineBar,
		aggregator: MetricAggregator.P50,
	},
	responseSize: {
		name: 'response_size',
		description: 'Network Response Size',
		units: 'kb',
		chart_type: DashboardChartType.TimelineBar,
		aggregator: MetricAggregator.P50,
	},
	statusCode: {
		name: 'status',
		description: 'HTTP Status Code',
		chart_type: DashboardChartType.Histogram,
	},
}
