import * as React from 'react'
import { Input, Select, Text } from '@highlight-run/ui/components'
import { Divider } from 'antd'

import { useProjectId } from '@/hooks/useProjectId'
import { useGraphingEditorContext } from '@/pages/Graphing/GraphingEditor/GraphingEditorContext'
import { useParams } from '@/util/react-router/useParams'
import { useGetVisualizationsQuery } from '@/graph/generated/hooks'
import { ProductType } from '@/graph/generated/schemas'
import { View, VIEW_OPTIONS } from '@/pages/Graphing/components/Graph'
import { LabeledRow } from '@/pages/Graphing/LabeledRow'
import { OptionDropdown } from '@/pages/Graphing/OptionDropdown'
import { ViewTypeSettings } from '@/pages/Graphing/GraphingEditor/ViewTypeSettings'

import * as style from '../GraphingEditor.css'

type Props = {
	isPreview: boolean
}

export const VisualizationSection: React.FC<Props> = ({ isPreview }) => {
	const { projectId } = useProjectId()
	const { dashboard_id } = useParams<{
		dashboard_id: string
	}>()

	const {
		settings,
		dashboardIdSetting,
		setDashboardIdSetting,
		setMetricViewTitle,
		tempMetricViewTitle,
		setViewType,
		setLineNullHandling,
		setTableNullHandling,
		setLineDisplay,
		setBarDisplay,
		setFunnelDisplay,
	} = useGraphingEditorContext()

	const { data: dashboardsData, loading: dashboardsLoading } =
		useGetVisualizationsQuery({
			variables: {
				project_id: projectId,
				input: '',
				count: 100,
				offset: 0,
			},
			skip: dashboard_id !== undefined,
			onCompleted: (data) => {
				setDashboardIdSetting(data.visualizations.results.at(0)?.id)
			},
		})

	const viewOptions = React.useMemo(() => {
		if (settings.productType === ProductType.Events) {
			return VIEW_OPTIONS
		}

		return VIEW_OPTIONS.filter(
			(v) =>
				settings.productType === ProductType.Metrics ||
				v.value !== 'Funnel chart',
		)
	}, [settings.productType])

	return (
		<>
			{dashboard_id === undefined && (
				<LabeledRow label="Dashboard" name="title">
					<Select
						options={
							dashboardsData?.visualizations.results.map((r) => ({
								name: r.name,
								value: r.id,
								id: r.id,
							})) ?? []
						}
						value={dashboardIdSetting}
						onValueChange={(o) => {
							setDashboardIdSetting(o.value)
						}}
						loading={dashboardsLoading}
					/>
				</LabeledRow>
			)}
			<LabeledRow label="Graph title" name="title">
				<Input
					type="text"
					name="title"
					placeholder={tempMetricViewTitle || 'Untitled graph'}
					value={settings.metricViewTitle}
					onChange={(e) => {
						setMetricViewTitle(e.target.value)
					}}
					cssClass={style.input}
					disabled={isPreview}
				/>
			</LabeledRow>
			<Divider className="m-0" />
			<Text weight="bold">Visualization</Text>
			<LabeledRow label="View type" name="viewType">
				<OptionDropdown
					options={viewOptions}
					selection={settings.viewType}
					setSelection={(s) => {
						s !== settings.viewType && setViewType(s as View)
					}}
					disabled={isPreview}
				/>
			</LabeledRow>
			<ViewTypeSettings
				viewType={settings.viewType as View}
				settings={settings}
				disabled={isPreview}
				setLineNullHandling={setLineNullHandling}
				setLineDisplay={setLineDisplay}
				setBarDisplay={setBarDisplay}
				setFunnelDisplay={setFunnelDisplay}
				setTableNullHandling={setTableNullHandling}
			/>
		</>
	)
}
