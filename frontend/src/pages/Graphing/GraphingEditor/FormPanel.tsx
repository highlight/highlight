import {
	Box,
	Button,
	ButtonIcon,
	Form,
	IconSolidX,
	Input,
	Select,
	Stack,
	TagSwitchGroup,
	Text,
} from '@highlight-run/ui/components'
import { Divider } from 'antd'
import React, { PropsWithChildren, useCallback, useMemo } from 'react'

import { SearchContext } from '@/components/Search/SearchContext'
import { Search } from '@/components/Search/SearchForm/SearchForm'

import { MetricAggregator, ProductType } from '@/graph/generated/schemas'
import {
	TIMESTAMP_KEY,
	View,
	VIEW_OPTIONS,
} from '@/pages/Graphing/components/Graph'

import { EventSteps } from '@pages/Graphing/EventSelection/EventSteps'
import { EventSelection } from '@pages/Graphing/EventSelection'
import { BUCKET_FREQUENCIES } from '@pages/Graphing/util'
import { Panel } from '@/pages/Graphing/components/Panel'
import { SqlEditor } from '@/pages/Graphing/components/SqlEditor'
import { useGetVisualizationsQuery } from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'
import { useGraphingEditorContext } from '@/pages/Graphing/GraphingEditor/GraphingEditorContext'
import { useGraphingVariables } from '@/pages/Graphing/hooks/useGraphingVariables'
import { useParams } from '@util/react-router/useParams'

import { Combobox } from '../Combobox'
import {
	BUCKET_BY_OPTIONS,
	BucketBySetting,
	EDITOR_OPTIONS,
	Editor,
	FUNCTION_TYPES,
	MAX_BUCKET_SIZE,
	MAX_LIMIT_SIZE,
	PRODUCT_OPTIONS,
} from '../constants'
import { LabeledRow } from '../LabeledRow'
import { OptionDropdown } from '../OptionDropdown'
import { ViewTypeSettings } from './ViewTypeSettings'
import * as style from './GraphingEditor.css'

type Props = {
	startDate: Date
	endDate: Date
	currentDashboardId: string
	isPreview: boolean
	loading: boolean
}

export const FormPanel: React.FC<Props> = ({
	startDate,
	endDate,
	currentDashboardId,
	isPreview,
	loading,
}) => {
	const { projectId } = useProjectId()
	const { dashboard_id } = useParams<{
		dashboard_id: string
	}>()

	const {
		settings,
		setEditor,
		dashboardIdSetting,
		setDashboardIdSetting,
		setMetricViewTitle,
		tempMetricViewTitle,
		setProductType,
		setViewType,
		setLineNullHandling,
		setTableNullHandling,
		setLineDisplay,
		setBarDisplay,
		setFunnelDisplay,
		setSql,
		sqlInternal,
		setSqlInternal,
		setQuery,
		setGroupByEnabled,
		setGroupByKeys,
		setLimitFunctionType,
		setLimit,
		setLimitMetric,
		setBucketByEnabled,
		setBucketBySetting,
		setBucketByKey,
		setBucketCount,
		setBucketInterval,
		setExpressions,
		setFunnelSteps,
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

	const viewOptions = useMemo(() => {
		if (settings.productType === ProductType.Events) {
			return VIEW_OPTIONS
		}

		return VIEW_OPTIONS.filter(
			(v) =>
				settings.productType === ProductType.Metrics ||
				v.value !== 'Funnel chart',
		)
	}, [settings.productType])

	const productOptions = useMemo(() => {
		if (settings.viewType === 'Funnel chart') {
			return PRODUCT_OPTIONS.filter((p) => p.value === ProductType.Events)
		}

		return PRODUCT_OPTIONS
	}, [settings.viewType])

	const searchOptionsConfig = useMemo(() => {
		return {
			productType: settings.productType,
			startDate,
			endDate,
		}
	}, [endDate, settings.productType, startDate])

	const { values } = useGraphingVariables(currentDashboardId)

	const variableKeys = Array.from(values).map(([key]) => {
		return `$${key}`
	})

	const handleLimitChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = Math.min(MAX_LIMIT_SIZE, parseInt(e.target.value))
			setLimit(value)
		},
		[setLimit],
	)

	const handleFunctionTypeChange = useCallback(
		(i: number) => (aggregator: MetricAggregator) => {
			setExpressions((expressions) => {
				const copy = [...expressions]
				copy[i].aggregator = aggregator

				if (aggregator === MetricAggregator.Count) {
					copy[i].column = ''
				}

				return copy
			})
		},
		[setExpressions],
	)

	const handleFunctionColumnChange = useCallback(
		(i: number) => (column: string) => {
			setExpressions((expressions) => {
				const copy = [...expressions]
				copy[i].column = column
				return copy
			})
		},
		[setExpressions],
	)

	const isSqlEditor = settings.editor === Editor.SqlEditor

	return (
		<Panel>
			<Form>
				<Stack gap="16">
					{dashboard_id === undefined && (
						<LabeledRow label="Dashboard" name="title">
							<Select
								options={
									dashboardsData?.visualizations.results.map(
										(r) => ({
											name: r.name,
											value: r.id,
											id: r.id,
										}),
									) ?? []
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
							placeholder={
								tempMetricViewTitle || 'Untitled graph'
							}
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
								s !== settings.viewType &&
									setViewType(s as View)
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
					<Divider className="m-0" />
					<SidebarSection>
						<Box cssClass={style.editorHeader}>
							<Box cssClass={style.editorSelect}>
								<OptionDropdown<Editor>
									options={EDITOR_OPTIONS}
									selection={settings.editor}
									setSelection={setEditor}
									disabled={isPreview}
								/>
							</Box>
							{isSqlEditor && (
								<Button
									disabled={
										loading || sqlInternal === settings.sql
									}
									onClick={() => {
										setSql(sqlInternal)
									}}
								>
									Update query
								</Button>
							)}
						</Box>
						{isSqlEditor ? (
							<Box cssClass={style.sqlEditorWrapper}>
								<SqlEditor
									value={sqlInternal}
									setValue={setSqlInternal}
									startDate={startDate}
									endDate={endDate}
								/>
							</Box>
						) : (
							<>
								<LabeledRow
									label="Source"
									name="source"
									tooltip="The resource being queried, one of the five highlight.io resources."
								>
									<OptionDropdown<ProductType>
										options={productOptions}
										selection={settings.productType}
										setSelection={(s) => {
											s !== settings.productType &&
												setProductType(s)
										}}
										disabled={isPreview}
									/>
								</LabeledRow>
								{settings.productType === ProductType.Events ? (
									settings.viewType === 'Funnel chart' ? (
										<EventSteps
											steps={settings.funnelSteps}
											setSteps={setFunnelSteps}
											startDate={startDate}
											endDate={endDate}
											// disabled={isPreview}
										/>
									) : (
										<EventSelection
											initialQuery={settings.query}
											setQuery={setQuery}
											startDate={startDate}
											endDate={endDate}
											// disabled={isPreview}
										/>
									)
								) : (
									<LabeledRow
										label="Filters"
										name="query"
										tooltip="The search query used to filter which data points are included before aggregating."
									>
										<Box
											border="divider"
											width="full"
											borderRadius="6"
										>
											<SearchContext
												initialQuery={settings.query}
												onSubmit={setQuery}
												disabled={isPreview}
											>
												<Search
													startDate={
														new Date(startDate)
													}
													endDate={new Date(endDate)}
													productType={
														settings.productType
													}
													hideIcon
													defaultValueOptions={
														variableKeys
													}
												/>
											</SearchContext>
										</Box>
									</LabeledRow>
								)}
								<LabeledRow
									label="Function"
									name="function"
									tooltip="Determines how data points are aggregated. If the function requires a numeric field as input, one can be chosen."
								>
									<Stack width="full" gap="12">
										{settings.expressions.map((e, i) => (
											<Stack
												direction="row"
												width="full"
												gap="4"
												key={`${e.aggregator}:${e.column}:${i}`}
											>
												<OptionDropdown
													options={FUNCTION_TYPES}
													selection={e.aggregator}
													setSelection={handleFunctionTypeChange(
														i,
													)}
													disabled={
														settings.viewType ===
															'Funnel chart' ||
														isPreview
													}
												/>
												<Combobox
													selection={e.column}
													setSelection={handleFunctionColumnChange(
														i,
													)}
													searchConfig={
														searchOptionsConfig
													}
													disabled={
														e.aggregator ===
															MetricAggregator.Count ||
														settings.viewType ===
															'Funnel chart' ||
														isPreview
													}
													onlyNumericKeys={
														e.aggregator !==
														MetricAggregator.CountDistinct
													}
													defaultKeys={variableKeys}
													placeholder={
														e.aggregator ===
														MetricAggregator.Count
															? 'Rows'
															: undefined
													}
												/>
												{settings.expressions.length >
													1 && (
													<ButtonIcon
														icon={<IconSolidX />}
														onClick={() => {
															setExpressions(
																(
																	expressions,
																) => {
																	const copy =
																		[
																			...expressions,
																		]
																	copy.splice(
																		i,
																		1,
																	)
																	return copy
																},
															)
														}}
														kind="secondary"
														emphasis="low"
													/>
												)}
											</Stack>
										))}
									</Stack>
								</LabeledRow>
								<Button
									kind="secondary"
									onClick={() => {
										setExpressions((expressions) => {
											return [
												...expressions,
												{
													aggregator:
														MetricAggregator.Count,
													column: '',
												},
											]
										})
									}}
								>
									Add function
								</Button>
							</>
						)}
					</SidebarSection>
					{!isSqlEditor && (
						<>
							<SidebarSection>
								<LabeledRow
									label="Group by"
									name="groupBy"
									enabled={settings.groupByEnabled}
									setEnabled={setGroupByEnabled}
									disabled={
										settings.viewType === 'Funnel chart' ||
										isPreview
									}
									tooltip="A categorical field for grouping results into separate series."
								>
									<Combobox
										selection={settings.groupByKeys}
										setSelection={setGroupByKeys}
										searchConfig={searchOptionsConfig}
										defaultKeys={variableKeys}
										disabled={
											settings.viewType ===
												'Funnel chart' || isPreview
										}
									/>
								</LabeledRow>
								{settings.groupByEnabled &&
								settings.viewType !== 'Table' &&
								settings.viewType !== 'Funnel chart' ? (
									<Box
										display="flex"
										flexDirection="row"
										gap="4"
									>
										<LabeledRow
											label="Limit"
											name="limit"
											tooltip="The maximum number of groups to include. Currently, the max is 100."
										>
											<Input
												type="number"
												name="limit"
												placeholder="Enter limit"
												value={settings.limit}
												onChange={handleLimitChange}
												cssClass={style.input}
												disabled={isPreview}
											/>
										</LabeledRow>
										<LabeledRow
											label="By"
											name="limitBy"
											tooltip="The function used to determine which groups are included."
										>
											<OptionDropdown
												options={FUNCTION_TYPES}
												selection={
													settings.limitFunctionType
												}
												setSelection={
													setLimitFunctionType
												}
												disabled={isPreview}
											/>
											<Combobox
												selection={
													settings.fetchedLimitMetric
												}
												setSelection={setLimitMetric}
												searchConfig={
													searchOptionsConfig
												}
												disabled={
													settings.limitFunctionType ===
														MetricAggregator.Count ||
													isPreview
												}
												onlyNumericKeys
												defaultKeys={variableKeys}
												placeholder={
													settings.limitFunctionType ===
													MetricAggregator.Count
														? 'Rows'
														: undefined
												}
											/>
										</LabeledRow>
									</Box>
								) : null}
							</SidebarSection>
							{settings.viewType !== 'Funnel chart' && (
								<SidebarSection>
									<LabeledRow
										label="Bucket by"
										name="bucketBy"
										tooltip="The method for determining the bucket sizes - can be a fixed interval or fixed count."
										enabled={settings.bucketByEnabled}
										setEnabled={setBucketByEnabled}
									>
										<TagSwitchGroup
											options={BUCKET_BY_OPTIONS}
											defaultValue={
												settings.bucketBySetting
											}
											onChange={(o: string | number) => {
												setBucketBySetting(
													o as BucketBySetting,
												)
											}}
											cssClass={style.tagSwitch}
											disabled={isPreview}
										/>
									</LabeledRow>
									{settings.bucketByEnabled &&
										settings.bucketBySetting ===
											'Count' && (
											<>
												<LabeledRow
													label="Bucket field"
													name="bucketField"
													tooltip="A numeric field for bucketing results along the X-axis. Timestamp for time series charts, numeric fields for histograms, can be disabled to aggregate all results within the time range."
												>
													<Combobox
														selection={
															settings.bucketByKey
														}
														setSelection={
															setBucketByKey
														}
														searchConfig={
															searchOptionsConfig
														}
														defaultKeys={[
															TIMESTAMP_KEY,
															...variableKeys,
														]}
														onlyNumericKeys
														disabled={isPreview}
													/>
												</LabeledRow>
												<LabeledRow
													label="Buckets"
													name="bucketCount"
													tooltip="The number of X-axis buckets. A higher value will display smaller, more granular buckets. Currently, the max is 100."
												>
													<Input
														type="number"
														name="bucketCount"
														placeholder="Enter bucket count"
														value={
															settings.bucketCount
														}
														onChange={(e) => {
															const newValue =
																Math.min(
																	MAX_BUCKET_SIZE,
																	parseInt(
																		e.target
																			.value,
																	),
																)

															setBucketCount(
																newValue,
															)
														}}
														cssClass={style.input}
														disabled={isPreview}
													/>
												</LabeledRow>
											</>
										)}
									{settings.bucketByEnabled &&
										settings.bucketBySetting ===
											'Interval' && (
											<LabeledRow
												label="Bucket interval"
												name="bucketInterval"
												tooltip="The number of X-axis buckets. A higher value will display smaller, more granular buckets."
											>
												<Select
													options={BUCKET_FREQUENCIES}
													value={
														settings.bucketInterval
													}
													onValueChange={(o) => {
														setBucketInterval(
															o.value,
														)
													}}
													disabled={isPreview}
												/>
											</LabeledRow>
										)}
								</SidebarSection>
							)}
						</>
					)}
				</Stack>
			</Form>
		</Panel>
	)
}

const SidebarSection = (props: PropsWithChildren) => {
	return (
		<Box
			p="6"
			width="full"
			display="flex"
			flexDirection="column"
			gap="12"
			border="divider"
			borderRadius="6"
		>
			{props.children}
		</Box>
	)
}
