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
	MetricExpression,
	SuggestionType,
} from '@/graph/generated/schemas'
import { BarDisplay } from '@/pages/Graphing/components/BarChart'
import { View } from '@/pages/Graphing/components/Graph'
import {
	LineDisplay,
	LineNullHandling,
} from '@/pages/Graphing/components/LineChart'
import { TableNullHandling } from '@/pages/Graphing/components/Table'
import { FunnelDisplay } from '@/pages/Graphing/components/types'
import { EventSelectionStep } from '@/pages/Graphing/util'

export const SETTINGS_PARAM = 'settings'

export const DEFAULT_BUCKET_COUNT = 50
export const DEFAULT_BUCKET_INTERVAL = 5 * 60

export const MAX_BUCKET_SIZE = 100
export const MAX_LIMIT_SIZE = 100
export const NO_LIMIT = 1_000_000_000_000

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

export type BucketBySetting = 'Interval' | 'Count'

export const BUCKET_BY_OPTIONS: BucketBySetting[] = ['Interval', 'Count']

export type GraphSettings = {
	productType: ProductType
	viewType: View
	functionType: MetricAggregator
	lineNullHandling: LineNullHandling
	lineDisplay: LineDisplay
	barDisplay: BarDisplay
	funnelDisplay: FunnelDisplay
	tableNullHandling: TableNullHandling
	query: string
	fetchedMetric: string
	metricViewTitle: string
	groupByEnabled: boolean
	groupByKeys: string[]
	limitFunctionType: MetricAggregator
	limit: number
	funnelSteps: EventSelectionStep[]
	bucketByEnabled: boolean
	bucketByKey: string
	bucketCount: number
	bucketInterval: number
	bucketBySetting: BucketBySetting
	fetchedLimitMetric: string
	expressions: MetricExpression[]
	editor: Editor
	sql: string
}
