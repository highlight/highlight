import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebounce } from 'react-use'

import {
	MetricAggregator,
	ProductType,
	Graph as GraphType,
} from '@/graph/generated/schemas'
import { BAR_DISPLAY, BarDisplay } from '@/pages/Graphing/components/BarChart'
import {
	TIMESTAMP_KEY,
	View,
	VIEW_OPTIONS,
} from '@/pages/Graphing/components/Graph'
import {
	LINE_DISPLAY,
	LINE_NULL_HANDLING,
	LineDisplay,
	LineNullHandling,
} from '@/pages/Graphing/components/LineChart'
import {
	TABLE_NULL_HANDLING,
	TableNullHandling,
} from '@/pages/Graphing/components/Table'
import {
	FUNNEL_DISPLAY,
	FunnelDisplay,
} from '@/pages/Graphing/components/types'
import {
	BUCKET_BY_OPTIONS,
	DEFAULT_BUCKET_COUNT,
	DEFAULT_BUCKET_INTERVAL,
	Editor,
	FUNCTION_TYPES,
	GraphSettings,
	MAX_LIMIT_SIZE,
	NO_LIMIT,
	PRODUCT_OPTIONS,
	SETTINGS_PARAM,
} from '@/pages/Graphing/constants'
import { GraphEditorContext } from '@/pages/Graphing/GraphingEditor/GraphingEditorContext'
import { EventSelectionStep, loadFunnelStep } from '@/pages/Graphing/util'
import { atobSafe, btoaSafe } from '@/util/string'

export const useGraphEditor = (): GraphEditorContext => {
	const [searchParams, setSearchParams] = useSearchParams()
	const settingsParam = searchParams.get(SETTINGS_PARAM)

	// form settings
	const [initialSettings] = useState(
		settingsParam !== null
			? (JSON.parse(atobSafe(settingsParam)) as GraphSettings)
			: undefined,
	)
	const [graphPreview, setGraphPreview] = useState<GraphType>()
	const [editor, setEditor] = useState(
		initialSettings?.editor ?? Editor.QueryBuilder,
	)

	// form
	const [dashboardIdSetting, setDashboardIdSetting] = useState<string>()
	const [metricViewTitle, setMetricViewTitle] = useState(
		initialSettings?.metricViewTitle ?? '',
	)

	const [productType, setProductTypeImpl] = useState(
		(searchParams.get('source') as ProductType) ??
			initialSettings?.productType ??
			PRODUCT_OPTIONS[0].value,
	)

	const setProductType = (pt: ProductType) => {
		if (productType !== ProductType.Events && viewType === 'Funnel chart') {
			setViewType(VIEW_OPTIONS[0].value as View)
		}
		if (productType === ProductType.Metrics && pt !== ProductType.Metrics) {
			setExpressions([
				{
					aggregator: MetricAggregator.Count,
					column: '',
				},
			])
		} else if (
			productType !== ProductType.Metrics &&
			pt === ProductType.Metrics
		) {
			setExpressions([
				{
					aggregator: MetricAggregator.Avg,
					column: 'value',
				},
			])
		}
		setProductTypeImpl(pt)
	}

	// visualizations
	const [viewType, setViewTypeImpl] = useState(
		initialSettings?.viewType ?? VIEW_OPTIONS[0].value,
	)
	const setViewType = (vt: View) => {
		if (vt === 'Funnel chart') {
			setBucketByEnabled(false)
			// once events have other session attributes, we can support per-user aggregation
			setExpressions([
				{
					aggregator: MetricAggregator.CountDistinct,
					column: 'secure_session_id',
				},
			])
			setGroupByEnabled(true)
			setGroupByKeys(['secure_session_id'])
			setLimit(NO_LIMIT)
		} else if (vt === 'Table') {
			setLimit(NO_LIMIT)
		} else {
			setLimit(MAX_LIMIT_SIZE)
		}
		setViewTypeImpl(vt)
	}

	const [lineNullHandling, setLineNullHandling] = useState(
		initialSettings?.lineNullHandling ?? LINE_NULL_HANDLING[0],
	)
	const [tableNullHandling, setTableNullHandling] = useState(
		initialSettings?.tableNullHandling ?? TABLE_NULL_HANDLING[0],
	)
	const [lineDisplay, setLineDisplay] = useState(
		initialSettings?.lineDisplay ?? LINE_DISPLAY[0],
	)
	const [barDisplay, setBarDisplay] = useState(
		initialSettings?.barDisplay ?? BAR_DISPLAY[0],
	)
	const [funnelDisplay, setFunnelDisplay] = useState(
		initialSettings?.funnelDisplay ?? FUNNEL_DISPLAY[0],
	)

	// sql editor
	const [sqlInternal, setSqlInternal] = useState(initialSettings?.sql ?? '')
	const [sql, setSql] = useState(sqlInternal)

	// query builder
	const [query, setQuery] = useState(
		searchParams.get('query') ?? initialSettings?.query ?? '',
	)
	const [debouncedQuery, setDebouncedQuery] = useState(
		initialSettings?.query ?? '',
	)
	useDebounce(
		() => {
			setDebouncedQuery(query)
		},
		300,
		[query],
	)

	const [groupByEnabled, setGroupByEnabled] = useState(
		initialSettings?.groupByEnabled ?? false,
	)
	const [groupByKeys, setGroupByKeys] = useState<string[]>(
		initialSettings?.groupByKeys ?? [],
	)
	const [limitFunctionType, setLimitFunctionType] = useState(
		initialSettings?.limitFunctionType ?? FUNCTION_TYPES[0],
	)
	const [limit, setLimit] = useState<number>(
		initialSettings?.limit ?? MAX_LIMIT_SIZE,
	)
	const [limitMetric, setLimitMetric] = useState(
		initialSettings?.fetchedLimitMetric ?? '',
	)
	const fetchedLimitMetric = useMemo(() => {
		return limitFunctionType === MetricAggregator.Count ? '' : limitMetric
	}, [limitFunctionType, limitMetric])
	const [bucketByEnabled, setBucketByEnabled] = useState(
		initialSettings?.bucketByEnabled ?? true,
	)
	const [bucketBySetting, setBucketBySetting] = useState(
		initialSettings?.bucketBySetting ?? BUCKET_BY_OPTIONS[0],
	)
	const [bucketByKey, setBucketByKey] = useState(
		initialSettings?.bucketByKey ?? TIMESTAMP_KEY,
	)
	const [bucketCount, setBucketCount] = useState<number>(
		initialSettings?.bucketCount ?? DEFAULT_BUCKET_COUNT,
	)
	const [bucketInterval, setBucketInterval] = useState<number>(
		initialSettings?.bucketInterval ?? DEFAULT_BUCKET_INTERVAL,
	)
	const [expressions, setExpressions] = useState(
		initialSettings?.expressions ?? [
			{
				aggregator: FUNCTION_TYPES[0],
				column: '',
			},
		],
	)

	// funnels
	const [funnelSteps, setFunnelSteps] = useState<EventSelectionStep[]>(
		initialSettings?.funnelSteps ?? [],
	)

	const tempMetricViewTitle = useMemo(() => {
		let tempTitle = expressions.at(0)?.aggregator?.toString() ?? ''
		if (expressions.at(0)?.column) {
			tempTitle += `(${expressions.at(0)?.column})`
		}
		tempTitle += ` of ${productType?.toString() ?? ''}`

		return tempTitle
	}, [expressions, productType])

	const formSettings = useMemo(
		() =>
			({
				productType,
				viewType,
				lineNullHandling,
				lineDisplay,
				barDisplay,
				funnelDisplay,
				tableNullHandling,
				query,
				metricViewTitle,
				groupByEnabled,
				groupByKeys,
				limitFunctionType,
				limit,
				funnelSteps,
				bucketByEnabled,
				bucketByKey,
				bucketCount,
				bucketInterval,
				bucketBySetting,
				fetchedLimitMetric,
				expressions,
				editor,
				sql,
			}) as GraphSettings,
		[
			barDisplay,
			bucketByEnabled,
			bucketByKey,
			bucketBySetting,
			bucketCount,
			bucketInterval,
			editor,
			expressions,
			fetchedLimitMetric,
			funnelDisplay,
			funnelSteps,
			groupByEnabled,
			groupByKeys,
			limit,
			limitFunctionType,
			lineDisplay,
			lineNullHandling,
			metricViewTitle,
			productType,
			query,
			sql,
			tableNullHandling,
			viewType,
		],
	)

	// show graph preview if
	const settings = useMemo(() => {
		if (graphPreview !== undefined) {
			const tempSettings = { ...formSettings }

			const viewType = graphPreview.type as View

			tempSettings.editor = Editor.QueryBuilder

			tempSettings.productType = graphPreview.productType
			tempSettings.viewType = viewType

			if (viewType === 'Line chart') {
				tempSettings.lineNullHandling =
					graphPreview.nullHandling as LineNullHandling
				tempSettings.lineDisplay = graphPreview.display as LineDisplay
			} else if (viewType === 'Bar chart') {
				tempSettings.barDisplay = graphPreview.display as BarDisplay
			} else if (viewType === 'Funnel chart') {
				tempSettings.funnelDisplay =
					graphPreview.display as FunnelDisplay
			} else if (viewType === 'Table') {
				tempSettings.tableNullHandling =
					graphPreview.nullHandling as TableNullHandling
			}

			tempSettings.query = graphPreview.query
			tempSettings.expressions = graphPreview.expressions
			tempSettings.metricViewTitle = graphPreview.title
			tempSettings.groupByEnabled =
				(graphPreview.groupByKeys ?? []).length > 0
			tempSettings.groupByKeys = graphPreview.groupByKeys ?? []
			tempSettings.limitFunctionType =
				graphPreview.limitFunctionType ?? FUNCTION_TYPES[0]
			tempSettings.limit = graphPreview.limit ?? 10
			tempSettings.fetchedLimitMetric =
				graphPreview.limitFunctionType === MetricAggregator.Count
					? ''
					: (graphPreview.limitMetric ?? '')
			tempSettings.funnelSteps = (graphPreview.funnelSteps ?? []).map(
				loadFunnelStep,
			)
			tempSettings.bucketByEnabled = !!graphPreview.bucketByKey
			tempSettings.bucketByKey = graphPreview.bucketByKey ?? '10'
			tempSettings.bucketCount =
				graphPreview.bucketCount ?? DEFAULT_BUCKET_COUNT
			tempSettings.bucketInterval =
				graphPreview.bucketInterval ?? DEFAULT_BUCKET_INTERVAL
			tempSettings.bucketBySetting = graphPreview.bucketInterval
				? 'Interval'
				: 'Count'

			return tempSettings
		}
		return formSettings
	}, [graphPreview, formSettings])

	useEffect(() => {
		const settingsEncoded = btoaSafe(JSON.stringify(formSettings))
		searchParams.set(SETTINGS_PARAM, settingsEncoded)
		setSearchParams(Object.fromEntries(searchParams.entries()), {
			replace: true,
		})
	}, [searchParams, setSearchParams, formSettings])

	return {
		// form settings
		initialSettings,
		graphPreview,
		setGraphPreview,
		settings,
		setEditor,
		// form
		dashboardIdSetting,
		setDashboardIdSetting,
		setMetricViewTitle,
		tempMetricViewTitle,
		setProductType,
		// visualization
		setViewType,
		setLineNullHandling,
		setTableNullHandling,
		setLineDisplay,
		setBarDisplay,
		setFunnelDisplay,
		// sql editor
		setSql,
		sqlInternal,
		setSqlInternal,
		// query builder
		setQuery,
		debouncedQuery,
		setDebouncedQuery,
		setGroupByEnabled,
		setGroupByKeys,
		setLimitFunctionType,
		setLimit,
		limitMetric,
		setLimitMetric,
		setBucketByEnabled,
		setBucketBySetting,
		setBucketByKey,
		setBucketCount,
		setBucketInterval,
		setExpressions,
		setFunnelSteps,
	}
}
