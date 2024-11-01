import {
	IconSolidChartBar,
	IconSolidFire,
	Box,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidPlayCircle,
	IconSolidTraces,
} from '@highlight-run/ui/components'
import { betaTag } from '@/components/Header/styles.css'
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
	// TODO(vkorolik) metrics disabled in the frontend to avoid confusion
	// {
	// 	name: ProductType.Metrics,
	// 	value: ProductType.Metrics,
	// 	icon: <IconSolidChartBar key="metrics" />,
	// }
]

export const PRODUCT_OPTIONS_WITH_EVENTS = PRODUCT_OPTIONS.concat([
	{
		name: ProductType.Events,
		value: ProductType.Events,
		icon: (
			<Box cssClass={betaTag} key="events">
				Beta
			</Box>
		),
	},
])

export const PRODUCTS_TO_ICONS = {
	[ProductType.Logs]: <IconSolidLogs key="logs" />,
	[ProductType.Traces]: <IconSolidTraces key="traces" />,
	[ProductType.Sessions]: <IconSolidPlayCircle key="sessions" />,
	[ProductType.Errors]: <IconSolidLightningBolt key="errors" />,
	[ProductType.Metrics]: <IconSolidChartBar key="metrics" />,
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
	'https://www.highlight.io/docs/general/product-features/metrics/graphing#graphing-fields'
