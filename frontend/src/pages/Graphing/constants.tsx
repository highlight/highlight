import {
	IconSolidChartBar,
	IconSolidFire,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidPlayCircle,
	IconSolidTraces,
	IconSolidMetrics,
	IconSolidChartSquareLine,
	IconSolidCode,
} from '@highlight-run/ui/components'
import {
	MetricAggregator,
	ProductType,
	SuggestionType,
} from '@/graph/generated/schemas'

export const DEFAULT_BUCKET_COUNT = 50
export const DEFAULT_BUCKET_INTERVAL = 60 * 60

export const TIME_METRICS = {
	active_length: 'ms',
	length: 'ms',
	duration: 'ns',
	Jank: 'ms',
	FCP: 'ms',
	FID: 'ms',
	LCP: 'ms',
	TTFB: 'ms',
	INP: 'ms',
}

export enum Editor {
	QueryBuilder = 'Query Builder',
	SqlEditor = 'SQL Editor',
}

export const EDITOR_OPTIONS = [
	{
		value: Editor.QueryBuilder,
		name: Editor.QueryBuilder,
		icon: <IconSolidChartSquareLine size={16} />,
	},
	{
		value: Editor.SqlEditor,
		name: Editor.SqlEditor,
		icon: <IconSolidCode size={16} />,
	},
]

export const PRODUCT_OPTIONS = [
	{
		name: ProductType.Logs,
		value: ProductType.Logs,
		icon: <IconSolidLogs key="logs" />,
	},
	{
		name: ProductType.Traces,
		value: ProductType.Traces,
		icon: <IconSolidTraces key="traces" />,
	},
	{
		name: ProductType.Sessions,
		value: ProductType.Sessions,
		icon: <IconSolidPlayCircle key="sessions" />,
	},
	{
		name: ProductType.Errors,
		value: ProductType.Errors,
		icon: <IconSolidLightningBolt key="errors" />,
	},
	{
		name: ProductType.Metrics,
		value: ProductType.Metrics,
		icon: <IconSolidMetrics key="metrics" />,
	},
	{
		name: ProductType.Events,
		value: ProductType.Events,
		icon: <IconSolidChartBar key="events" />,
	},
]

export const PRODUCTS_TO_ICONS = {
	[ProductType.Logs]: <IconSolidLogs key="logs" />,
	[ProductType.Traces]: <IconSolidTraces key="traces" />,
	[ProductType.Sessions]: <IconSolidPlayCircle key="sessions" />,
	[ProductType.Errors]: <IconSolidLightningBolt key="errors" />,
	[ProductType.Metrics]: <IconSolidMetrics key="metrics" />,
	[ProductType.Events]: <IconSolidFire key="events" />,
}

export const NUMERIC_FUNCTION_TYPES: MetricAggregator[] = [
	MetricAggregator.Min,
	MetricAggregator.Avg,
	MetricAggregator.P50,
	MetricAggregator.P90,
	MetricAggregator.P95,
	MetricAggregator.P99,
	MetricAggregator.Max,
	MetricAggregator.Sum,
]

export const FUNCTION_TYPES: MetricAggregator[] = [
	MetricAggregator.Count,
	MetricAggregator.CountDistinct,
	...NUMERIC_FUNCTION_TYPES,
]

export const SUGGESTION_TYPES: SuggestionType[] = [
	SuggestionType.Value,
	SuggestionType.Key,
	SuggestionType.None,
]

export const GRAPHING_FIELD_DOCS_LINK =
	'https://www.highlight.io/docs/general/product-features/dashboards/graphing#graphing-fields'
