import {
	MetricAggregator,
	MetricExpression,
	ProductType,
	Graph as GraphType,
} from '@/graph/generated/schemas'
import { BarDisplay } from '@/pages/Graphing/components/BarChart'
import { View } from '@/pages/Graphing/components/Graph'
import {
	LineDisplay,
	LineNullHandling,
} from '@/pages/Graphing/components/LineChart'
import { TableNullHandling } from '@/pages/Graphing/components/Table'
import { FunnelDisplay } from '@/pages/Graphing/components/types'
import {
	BucketBySetting,
	Editor,
	GraphSettings,
} from '@/pages/Graphing/constants'
import { EventSelectionStep } from '@/pages/Graphing/util'
import { createContext } from '@util/context/context'

export type GraphEditorContext = {
	// form settings
	initialSettings?: GraphSettings
	settings: GraphSettings
	graphPreview?: GraphType
	setGraphPreview: React.Dispatch<React.SetStateAction<GraphType | undefined>>
	setEditor: React.Dispatch<React.SetStateAction<Editor>>
	// form
	dashboardIdSetting?: string
	setDashboardIdSetting: React.Dispatch<
		React.SetStateAction<string | undefined>
	>
	setMetricViewTitle: React.Dispatch<React.SetStateAction<string>>
	tempMetricViewTitle: string
	setProductType: (productType: ProductType) => void
	// visualization
	setViewType: (viewType: View) => void
	setLineNullHandling: React.Dispatch<React.SetStateAction<LineNullHandling>>
	setLineDisplay: React.Dispatch<React.SetStateAction<LineDisplay>>
	setBarDisplay: React.Dispatch<React.SetStateAction<BarDisplay>>
	setFunnelDisplay: React.Dispatch<React.SetStateAction<FunnelDisplay>>
	setTableNullHandling: React.Dispatch<
		React.SetStateAction<TableNullHandling>
	>
	// sql editor
	setSql: React.Dispatch<React.SetStateAction<string>>
	sqlInternal: string
	setSqlInternal: React.Dispatch<React.SetStateAction<string>>
	// query builder
	setQuery: React.Dispatch<React.SetStateAction<string>>
	debouncedQuery: string
	setDebouncedQuery: React.Dispatch<React.SetStateAction<string>>
	setGroupByEnabled: React.Dispatch<React.SetStateAction<boolean>>
	setGroupByKeys: React.Dispatch<React.SetStateAction<string[]>>
	setLimitFunctionType: React.Dispatch<React.SetStateAction<MetricAggregator>>
	setLimit: React.Dispatch<React.SetStateAction<number>>
	limitMetric: string
	setLimitMetric: React.Dispatch<React.SetStateAction<string>>
	setBucketByEnabled: React.Dispatch<React.SetStateAction<boolean>>
	setBucketBySetting: React.Dispatch<React.SetStateAction<BucketBySetting>>
	setBucketByKey: React.Dispatch<React.SetStateAction<string>>
	setBucketCount: React.Dispatch<React.SetStateAction<number>>
	setBucketInterval: React.Dispatch<React.SetStateAction<number>>
	setExpressions: React.Dispatch<React.SetStateAction<MetricExpression[]>>
	setFunnelSteps: React.Dispatch<React.SetStateAction<EventSelectionStep[]>>
}

export const [useGraphingEditorContext, GraphingEditorContextProvider] =
	createContext<GraphEditorContext>('GraphingEditorContext')
