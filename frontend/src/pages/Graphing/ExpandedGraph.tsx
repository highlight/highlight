import {
	Box,
	Button,
	IconSolidArrowLeft,
	IconSolidChartBar,
	IconSolidCheveronRight,
	IconSolidPencil,
	presetValue,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { Helmet } from 'react-helmet'
import { Link, useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

import {
	useDeleteGraphMutation,
	useGetVisualizationQuery,
} from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'
import Graph, { useGetViewConfig } from '@/pages/Graphing/components/Graph'
import { HeaderDivider } from '@/pages/Graphing/Dashboard'
import { GraphBackgroundWrapper } from '@/pages/Graphing/GraphingEditor'
import { useParams } from '@/util/react-router/useParams'
import { useGraphingVariables } from '@/pages/Graphing/hooks/useGraphingVariables'
import { useRetentionPresets } from '@/components/Search/SearchForm/hooks'
import { GraphContextProvider } from '@pages/Graphing/context/GraphContext'
import { useGraphData } from '@pages/Graphing/hooks/useGraphData'
import { useGraphTime } from '@/pages/Graphing/hooks/useGraphTime'
import { exportGraph } from '@/pages/Graphing/hooks/exportGraph'
import { loadFunnelStep } from '@/pages/Graphing/util'
import { Editor, GraphSettings } from '@/pages/Graphing/constants'
import {
	MetricAggregator,
	ThresholdCondition,
	ThresholdType,
} from '@/graph/generated/schemas'
import {
	AlertSettings,
	DEFAULT_COOLDOWN,
	DEFAULT_WINDOW,
	SETTINGS_PARAM,
} from '@/pages/Alerts/AlertForm'
import { toast } from '@/components/Toaster'
import { ActionBar } from '@/pages/Graphing/components/ActionBar'
import { btoaSafe, copyToClipboard } from '@/util/string'

import * as style from './Dashboard.css'

export const ExpandedGraph = () => {
	const { dashboard_id, graph_id } = useParams<{
		dashboard_id: string
		graph_id: string
	}>()

	const { projectId } = useProjectId()
	const graphContext = useGraphData()

	const [deleteGraph] = useDeleteGraphMutation()

	const { data } = useGetVisualizationQuery({
		variables: { id: dashboard_id! },
	})

	const { presets } = useRetentionPresets()

	const {
		startDate,
		endDate,
		selectedPreset,
		updateSearchTime,
		rebaseSearchTime,
	} = useGraphTime(presets)

	const navigate = useNavigate()

	const { values } = useGraphingVariables(dashboard_id!)

	const g = data?.visualization.graphs.find((g) => g.id === graph_id)

	const viewConfig = useGetViewConfig(
		g?.type ?? '',
		g?.display,
		g?.nullHandling,
	)

	const handleDownload = useCallback(() => {
		if (!g) {
			return
		}

		return exportGraph(
			g.id,
			g.title,
			graphContext.graphData.current
				? graphContext.graphData.current[g.id]
				: [],
		)
	}, [g, graphContext.graphData])

	const handleClone = useCallback(() => {
		if (!g) {
			return
		}

		const graphInput = {
			productType: g.productType,
			viewType: g.type,
			lineNullHandling: g.nullHandling,
			lineDisplay: g.display,
			barDisplay: g.display,
			funnelDisplay: g.display,
			tableNullHandling: g.nullHandling,
			query: g.query,
			metricViewTitle: `${g.title} copy`,
			groupByEnabled: !!g.groupByKeys?.length,
			groupByKeys: g.groupByKeys,
			limitFunctionType: g.limitFunctionType,
			limit: g.limit,
			funnelSteps: (g.funnelSteps ?? []).map(loadFunnelStep),
			bucketByEnabled: !!g.bucketByKey,
			bucketByKey: g.bucketByKey,
			bucketCount: g.bucketCount,
			bucketInterval: g.bucketInterval,
			bucketBySetting: g.bucketInterval ? 'Interval' : 'Count',
			expressions: g.expressions,
			editor: g.sql ? Editor.SqlEditor : Editor.QueryBuilder,
			sql: g.sql,
		} as GraphSettings

		navigate({
			pathname: `/${projectId}/dashboards/new`,
			search: `settings=${btoaSafe(JSON.stringify(graphInput))}`,
		})
	}, [g, navigate, projectId])

	const handleDelete = useCallback(() => {
		if (!g) {
			return
		}

		deleteGraph({
			variables: {
				id: g.id,
			},
			optimisticResponse: {
				deleteGraph: true,
			},
			update(cache) {
				const vizId = cache.identify({
					id: dashboard_id,
					__typename: 'Visualization',
				})
				const graphId = cache.identify({
					id: g.id,
					__typename: 'Graph',
				})
				cache.modify({
					id: vizId,
					fields: {
						graphs(existing = []) {
							const filtered = existing.filter(
								(e: any) => e.__ref !== graphId,
							)
							return filtered
						},
					},
				})
			},
		})
			.then(() => {
				toast.success('Graph deleted')
				navigate(`/${projectId}/dashboards/${dashboard_id}`)
			})
			.catch(() => toast.error('Failed to delete graph'))
	}, [dashboard_id, deleteGraph, g, navigate, projectId])

	const handleCreateAlert = useCallback(() => {
		if (!g) {
			return
		}

		const func = g.expressions.at(0)?.aggregator ?? MetricAggregator.Count
		const col = g.expressions.at(0)?.column ?? ''
		const groupByKey = g.groupByKeys?.at(0) ?? undefined
		const settings: AlertSettings = {
			productType: g.productType,
			functionType: func,
			functionColumn: col,
			query: g.query,
			alertName: g.title,
			groupByEnabled: groupByKey !== undefined,
			groupByKey: groupByKey ?? '',
			thresholdValue: 1,
			thresholdCondition: ThresholdCondition.Above,
			thresholdType: ThresholdType.Constant,
			thresholdWindow: g.bucketInterval ?? DEFAULT_WINDOW,
			thresholdCooldown: g.bucketInterval ?? DEFAULT_COOLDOWN,
			destinations: [],
			editor: Editor.QueryBuilder,
			sql: undefined,
		}

		const settingsEncoded = btoaSafe(JSON.stringify(settings))

		let search = ''
		if (selectedPreset !== undefined) {
			search += `relative_time=${presetValue(selectedPreset)}&`
		}
		search += `${SETTINGS_PARAM}=${settingsEncoded}`

		navigate({
			pathname: `/${projectId}/alerts/new`,
			search,
		})
	}, [g, navigate, projectId, selectedPreset])

	const handleShare = () => {
		copyToClipboard(window.location.href, { onCopyText: 'Copied link!' })
	}

	const handleEdit = () => {
		if (!g) {
			return
		}

		navigate({
			pathname: `/${projectId}/dashboards/${dashboard_id}/edit/${g.id}`,
			search: location.search,
		})
	}

	if (g === undefined) {
		return null
	}

	return (
		<GraphContextProvider value={graphContext}>
			<Helmet>
				<title>Dashboard</title>
			</Helmet>
			<Box
				background="n2"
				padding="8"
				flex="stretch"
				justifyContent="stretch"
				display="flex"
			>
				<Box
					background="white"
					borderRadius="6"
					flexDirection="column"
					display="flex"
					flexGrow={1}
					border="dividerWeak"
					shadow="medium"
				>
					<Box
						width="full"
						cssClass={style.editGraphHeader}
						borderBottom="dividerWeak"
						display="flex"
						justifyContent="space-between"
						alignItems="center"
						paddingLeft="12"
						paddingRight="8"
						py="6"
					>
						<Stack
							display="flex"
							direction="row"
							alignItems="center"
							gap="4"
						>
							<Button
								emphasis="medium"
								kind="secondary"
								iconLeft={<IconSolidArrowLeft />}
								onClick={() => {
									navigate({
										pathname: `../${dashboard_id}`,
										search: location.search,
									})
								}}
							>
								Back
							</Button>
							<HeaderDivider />
							<Link to="..">
								<Stack>
									<Tag
										shape="basic"
										size="medium"
										kind="secondary"
										iconLeft={<IconSolidChartBar />}
									>
										Dashboards
									</Tag>
								</Stack>
							</Link>
							<IconSolidCheveronRight
								color={vars.theme.static.content.weak}
							/>
							<Text size="small" weight="medium" color="default">
								{data?.visualization.name}
							</Text>
						</Stack>
						<Box display="flex" gap="4">
							<Button
								emphasis="low"
								kind="secondary"
								onClick={handleShare}
							>
								Share
							</Button>
							<HeaderDivider />
							<Button
								emphasis="medium"
								kind="secondary"
								iconLeft={<IconSolidPencil />}
								onClick={handleEdit}
							>
								Edit
							</Button>
						</Box>
					</Box>
					<ActionBar
						handleRefresh={rebaseSearchTime}
						dateRangeValue={{
							startDate,
							endDate,
							selectedPreset,
						}}
						updateSearchTime={updateSearchTime}
						onDownload={handleDownload}
						onClone={handleClone}
						onDelete={handleDelete}
						onCreateAlert={handleCreateAlert}
					/>
					<Box
						display="flex"
						flexDirection="row"
						justifyContent="space-between"
						height="full"
					>
						<GraphBackgroundWrapper>
							<Box px="16" py="12" width="full" height="full">
								<Graph
									id={g.id}
									title={g.title}
									viewConfig={viewConfig}
									productType={g.productType}
									projectId={projectId}
									startDate={startDate}
									endDate={endDate}
									query={g.query}
									sql={g.sql ?? undefined}
									bucketByKey={g.bucketByKey ?? undefined}
									bucketByWindow={
										g.bucketInterval ?? undefined
									}
									bucketCount={g.bucketCount ?? undefined}
									groupByKeys={g.groupByKeys ?? undefined}
									limit={g.limit ?? undefined}
									limitFunctionType={
										g.limitFunctionType ?? undefined
									}
									limitMetric={g.limitMetric ?? undefined}
									setTimeRange={updateSearchTime}
									variables={values}
									expressions={g.expressions}
								/>
							</Box>
						</GraphBackgroundWrapper>
					</Box>
				</Box>
			</Box>
		</GraphContextProvider>
	)
}
