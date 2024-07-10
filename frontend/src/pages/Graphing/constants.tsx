import {
	IconSolidChartBar,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidPlayCircle,
	IconSolidTraces,
} from '@highlight-run/ui/components'

import { MetricAggregator, ProductType } from '@/graph/generated/schemas'

export const DEFAULT_BUCKET_COUNT = 50

export const PRODUCTS: ProductType[] = [
	ProductType.Logs,
	ProductType.Traces,
	ProductType.Sessions,
	ProductType.Errors,
	ProductType.Metrics,
]

export const PRODUCT_ICONS = [
	<IconSolidLogs key="logs" />,
	<IconSolidTraces key="traces" />,
	<IconSolidPlayCircle key="sessions" />,
	<IconSolidLightningBolt key="errors" />,
	<IconSolidChartBar key="metrics" />,
]

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

export const GRAPHING_FIELD_DOCS_LINK =
	'https://www.highlight.io/docs/general/product-features/metrics/graphing#graphing-fields'
