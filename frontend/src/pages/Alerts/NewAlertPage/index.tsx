import { toast } from '@components/Toaster'
import {
	Box,
	Button,
	DateRangePicker,
	DEFAULT_TIME_PRESETS,
	Form,
	Input,
	presetStartDate,
	Text,
} from '@highlight-run/ui/components'
import { Divider } from 'antd'
import React, { PropsWithChildren, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from 'react-use'

import { SearchContext } from '@/components/Search/SearchContext'
import { Search } from '@/components/Search/SearchForm/SearchForm'
import { useCreateAlertMutation } from '@/graph/generated/hooks'
import { MetricAggregator, ProductType } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { useSearchTime } from '@/hooks/useSearchTime'
import {
	ALERT_CONDITION_OPTIONS,
	AlertCondition,
} from '@/pages/Alerts/constants'
import { Combobox } from '@/pages/Graphing/Combobox'
import Graph, { getViewConfig } from '@/pages/Graphing/components/Graph'
import {
	LINE_DISPLAY,
	LINE_NULL_HANDLING,
} from '@/pages/Graphing/components/LineChart'
import {
	FUNCTION_TYPES,
	PRODUCT_ICONS,
	PRODUCTS,
} from '@/pages/Graphing/constants'
import { HeaderDivider } from '@/pages/Graphing/Dashboard'
import { LabeledRow } from '@/pages/Graphing/LabeledRow'
import { OptionDropdown } from '@/pages/Graphing/OptionDropdown'

import * as style from './styles.css'

const SidebarSection = (props: PropsWithChildren) => {
	return (
		<Box p="12" width="full" display="flex" flexDirection="column" gap="12">
			{props.children}
		</Box>
	)
}

const EditorBackground = () => {
	return (
		<svg width="100%" height="100%">
			<defs>
				<pattern
					id="polka-dots"
					x="0"
					y="0"
					width="14"
					height="14"
					patternUnits="userSpaceOnUse"
				>
					<circle fill="#e4e2e4" cx="7" cy="7" r="1" />
				</pattern>
			</defs>

			<rect
				x="0"
				y="0"
				width="100%"
				height="100%"
				fill="url(#polka-dots)"
			/>
		</svg>
	)
}

export const NewAlertPage: React.FC = () => {
	const { projectId } = useProjectId()

	const { startDate, endDate, selectedPreset, updateSearchTime } =
		useSearchTime({
			presets: DEFAULT_TIME_PRESETS,
			initialPreset: DEFAULT_TIME_PRESETS[2],
		})

	const [createAlert, createAlertContext] = useCreateAlertMutation()

	const navigate = useNavigate()

	const [productType, setProductType] = useState(PRODUCTS[0])
	const [functionType, setFunctionType] = useState(FUNCTION_TYPES[0])
	const [query, setQuery] = useState('')
	const [debouncedQuery, setDebouncedQuery] = useState('')
	useDebounce(
		() => {
			setDebouncedQuery(query)
		},
		300,
		[query],
	)

	const [metric, setMetric] = useState('')
	const [alertName, setAlertName] = useState('')
	const [groupByEnabled, setGroupByEnabled] = useState(false)
	const [groupByKey, setGroupByKey] = useState('')

	const [belowThreshold, setBelowThreshold] = useState(false)
	const [thresholdCount, setThresholdCount] = useState(10)
	const [thresholdWindow, setThresholdWindow] = useState(60)
	const [thresholdCooldown, setThresholdCooldown] = useState(60)

	const viewConfig = getViewConfig(
		'Line chart',
		LINE_DISPLAY[0],
		LINE_NULL_HANDLING[2],
	)

	const onSave = () => {
		createAlert({
			variables: {
				project_id: projectId,
				name: alertName,
				product_type: productType,
				function_type: functionType,
				query: debouncedQuery,
				group_by_key: groupByEnabled ? groupByKey : undefined,
				below_threshold: belowThreshold,
				threshold_count: thresholdCount,
				threshold_window: thresholdWindow,
				threshold_cooldown: thresholdCooldown,
			},
		})
			.then(() => {
				toast.success(`${alertName} created`)
				navigate('/alerts')
			})
			.catch(() => {
				toast.error('Failed to create alert')
			})
	}

	const searchOptionsConfig = useMemo(() => {
		return {
			productType,
			startDate,
			endDate,
		}
	}, [productType, startDate, endDate])

	return (
		<>
			<Helmet>
				<title>Create Alert</title>
			</Helmet>
			<Box
				background="n2"
				padding="8"
				flex="stretch"
				justifyContent="stretch"
				display="flex"
				overflow="hidden"
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
						<Text size="small" weight="medium">
							Create alert
						</Text>
						<Box display="flex" gap="4">
							<DateRangePicker
								emphasis="low"
								kind="secondary"
								selectedValue={{
									startDate,
									endDate,
									selectedPreset,
								}}
								onDatesChange={updateSearchTime}
								presets={DEFAULT_TIME_PRESETS}
								minDate={presetStartDate(
									DEFAULT_TIME_PRESETS[5],
								)}
							/>
							<HeaderDivider />
							<Button
								emphasis="low"
								kind="secondary"
								onClick={() => {
									navigate('/alerts')
								}}
							>
								Cancel
							</Button>
							<Button
								disabled={createAlertContext.loading}
								onClick={onSave}
							>
								Save&nbsp;
							</Button>
						</Box>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						justifyContent="space-between"
						cssClass={style.editGraphPanel}
					>
						<Box
							display="flex"
							position="relative"
							height="full"
							cssClass={style.previewWindow}
						>
							<Box
								position="absolute"
								width="full"
								height="full"
								cssClass={style.graphBackground}
							>
								<EditorBackground />
							</Box>

							<Box cssClass={style.graphWrapper} shadow="small">
								<Box
									px="16"
									py="12"
									width="full"
									height="full"
									border="divider"
									borderRadius="8"
								>
									<Graph
										title={alertName || 'Untitled alert'}
										viewConfig={viewConfig}
										productType={productType}
										projectId={projectId}
										startDate={startDate}
										selectedPreset={selectedPreset}
										endDate={endDate}
										query={debouncedQuery}
										metric={metric}
										functionType={functionType}
										groupByKey={
											groupByEnabled
												? groupByKey
												: undefined
										}
										setTimeRange={updateSearchTime}
										bucketByKey="timestamp"
										bucketCount={50}
									/>
								</Box>
							</Box>
						</Box>
						<Box
							display="flex"
							borderLeft="dividerWeak"
							height="full"
							cssClass={style.editGraphSidebar}
							overflowY="auto"
							overflowX="hidden"
						>
							<Form className={style.editGraphSidebar}>
								<SidebarSection>
									<LabeledRow
										label="Alert title"
										name="title"
									>
										<Input
											type="text"
											name="title"
											placeholder="Untitled alert"
											value={alertName}
											onChange={(e) => {
												setAlertName(e.target.value)
											}}
											cssClass={style.input}
										/>
									</LabeledRow>
								</SidebarSection>
								<Divider className="m-0" />
								<SidebarSection>
									<LabeledRow
										label="Source"
										name="source"
										tooltip="The resource being queried, one of the four highlight.io resources."
									>
										<OptionDropdown<ProductType>
											options={PRODUCTS}
											selection={productType}
											setSelection={setProductType}
											icons={PRODUCT_ICONS}
										/>
									</LabeledRow>
								</SidebarSection>
								<Divider className="m-0" />
								<SidebarSection>
									<LabeledRow
										label="Function"
										name="function"
										tooltip="Determines how data points are aggregated. If the function requires a numeric field as input, one can be chosen."
									>
										<OptionDropdown<MetricAggregator>
											options={FUNCTION_TYPES}
											selection={functionType}
											setSelection={setFunctionType}
										/>
										{functionType !==
											MetricAggregator.Count && (
											<Combobox
												selection={metric}
												setSelection={setMetric}
												label="metric"
												searchConfig={
													searchOptionsConfig
												}
												onlyNumericKeys={
													functionType !==
													MetricAggregator.CountDistinct
												}
											/>
										)}
									</LabeledRow>
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
												initialQuery={query}
												onSubmit={setQuery}
											>
												<Search
													startDate={
														new Date(startDate)
													}
													endDate={new Date(endDate)}
													productType={productType}
													hideIcon
												/>
											</SearchContext>
										</Box>
									</LabeledRow>
								</SidebarSection>
								<Divider className="m-0" />
								<SidebarSection>
									<LabeledRow
										label="Alert conditions"
										name="alertConditions"
									>
										<OptionDropdown<AlertCondition>
											options={ALERT_CONDITION_OPTIONS}
											selection={
												belowThreshold
													? AlertCondition.Below
													: AlertCondition.Above
											}
											setSelection={(option) => {
												setBelowThreshold(
													option ==
														AlertCondition.Below,
												)
											}}
										/>
									</LabeledRow>
									<LabeledRow
										label="Threshold count"
										name="thresholdCount"
									>
										<Input
											name="thresholdCount"
											type="number"
											value={thresholdCount}
											onChange={(e) => {
												setThresholdCount(
													Number(e.target.value),
												)
											}}
										/>
									</LabeledRow>
									<LabeledRow
										label="Threshold window"
										name="thresholdWindow"
									>
										<Input
											name="thresholdWindow"
											type="number"
											value={thresholdWindow}
											onChange={(e) => {
												setThresholdWindow(
													Number(e.target.value),
												)
											}}
										/>
									</LabeledRow>
									<LabeledRow
										label="Threshold cooldown"
										name="thresholdCooldown"
									>
										<Input
											name="thresholdCooldown"
											type="number"
											value={thresholdCooldown}
											onChange={(e) => {
												setThresholdCooldown(
													Number(e.target.value),
												)
											}}
										/>
									</LabeledRow>
								</SidebarSection>
								<Divider className="m-0" />
								<SidebarSection>
									<LabeledRow
										label="Group by"
										name="groupBy"
										enabled={groupByEnabled}
										setEnabled={setGroupByEnabled}
										tooltip="A categorical field for grouping results into separate series."
									>
										<Combobox
											selection={groupByKey}
											setSelection={setGroupByKey}
											label="groupBy"
											searchConfig={searchOptionsConfig}
										/>
									</LabeledRow>
								</SidebarSection>
							</Form>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}
