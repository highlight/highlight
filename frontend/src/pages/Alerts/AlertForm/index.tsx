import { Button } from '@components/Button'
import { toast } from '@components/Toaster'
import {
	Box,
	Callout,
	DateRangePicker,
	DEFAULT_TIME_PRESETS,
	Form,
	Input,
	presetStartDate,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import { Divider } from 'antd'
import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { SearchContext } from '@/components/Search/SearchContext'
import { Search } from '@/components/Search/SearchForm/SearchForm'
import {
	useCreateAlertMutation,
	useDeleteAlertMutation,
	useGetAlertQuery,
	useUpdateAlertMutation,
} from '@/graph/generated/hooks'
import { namedOperations } from '@/graph/generated/operations'
import {
	AlertDestinationInput,
	MetricAggregator,
	ProductType,
} from '@/graph/generated/schemas'
import useFeatureFlag, { Feature } from '@/hooks/useFeatureFlag/useFeatureFlag'
import { useProjectId } from '@/hooks/useProjectId'
import { useSearchTime } from '@/hooks/useSearchTime'
import { FREQUENCIES } from '@/pages/Alerts/AlertConfigurationCard/AlertConfigurationConstants'
import {
	ALERT_CONDITION_OPTIONS,
	AlertCondition,
} from '@/pages/Alerts/constants'
import { DestinationInput } from '@/pages/Alerts/DestinationInput'
import { Combobox } from '@/pages/Graphing/Combobox'
import {
	FUNCTION_TYPES,
	PRODUCT_ICONS,
	PRODUCT_ICONS_WITH_EVENTS,
	PRODUCTS,
	PRODUCTS_WITH_EVENTS,
} from '@/pages/Graphing/constants'
import { HeaderDivider } from '@/pages/Graphing/Dashboard'
import { LabeledRow } from '@/pages/Graphing/LabeledRow'
import { OptionDropdown } from '@/pages/Graphing/OptionDropdown'

import { AlertGraph } from '../AlertGraph'
import * as style from './styles.css'

const SidebarSection = (props: PropsWithChildren) => {
	return (
		<Box p="12" width="full" display="flex" flexDirection="column" gap="12">
			{props.children}
		</Box>
	)
}

const FREQUENCY_OPTIONS = FREQUENCIES.filter((freq) => Number(freq.value) >= 60)

const MINUTE = 60
const WEEK = 7 * 24 * 60 * MINUTE

const DEFAULT_THRESHOLD = 1
const DEFAULT_WINDOW = MINUTE * 30
const DEFAULT_COOLDOWN = MINUTE * 30

const ALERT_PRODUCT_INFO = {
	[ProductType.Sessions]:
		"Alerts once for every session that matches the condition's filters.",
	[ProductType.Errors]:
		'Alerts every time an open error matches the specified conditions.',
	[ProductType.Logs]: false,
	[ProductType.Traces]: false,
	[ProductType.Metrics]: false,
	[ProductType.Events]: false,
}

export const AlertForm: React.FC = () => {
	const { projectId } = useProjectId()
	const { alert_id } = useParams<{
		alert_id: string
	}>()
	const [searchParams] = useSearchParams()

	const eventSearchEnabled = useFeatureFlag(Feature.EventSearch)
	const { products, productIcons } = useMemo(() => {
		if (!eventSearchEnabled) {
			return {
				products: PRODUCTS,
				productIcons: PRODUCT_ICONS,
			}
		}
		return {
			products: PRODUCTS_WITH_EVENTS,
			productIcons: PRODUCT_ICONS_WITH_EVENTS,
		}
	}, [eventSearchEnabled])

	const isEdit = alert_id !== undefined

	const { startDate, endDate, selectedPreset, updateSearchTime } =
		useSearchTime({
			presets: DEFAULT_TIME_PRESETS,
			initialPreset: DEFAULT_TIME_PRESETS[2],
		})

	const [createAlert, createAlertContext] = useCreateAlertMutation({
		refetchQueries: [
			namedOperations.Query.GetAlert,
			namedOperations.Query.GetAlertsPagePayload,
		],
	})
	const [updateAlert, updateAlertContext] = useUpdateAlertMutation({
		refetchQueries: [
			namedOperations.Query.GetAlert,
			namedOperations.Query.GetAlertsPagePayload,
		],
	})
	const [deleteAlertMutation] = useDeleteAlertMutation({
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})

	const navigate = useNavigate()

	const [alertName, setAlertName] = useState('')
	const [productType, setProductType] = useState(
		(searchParams.get('source') as ProductType) || products[0],
	)
	const [functionType, setFunctionType] = useState(MetricAggregator.Count)
	const [functionColumn, setFunctionColumn] = useState('')

	const isErrorAlert = productType === ProductType.Errors
	const isSessionAlert = productType === ProductType.Sessions

	const [query, setQuery] = useState(searchParams.get('query') ?? '')

	const [groupByEnabled, setGroupByEnabled] = useState(false)
	const [groupByKey, setGroupByKey] = useState('')

	const [belowThreshold, setBelowThreshold] = useState(false)
	const [thresholdValue, setThresholdValue] = useState(DEFAULT_THRESHOLD)
	const [thresholdWindow, setThresholdWindow] = useState(DEFAULT_WINDOW)
	const [thresholdCooldown, setThresholdCooldown] =
		useState<number>(DEFAULT_COOLDOWN)

	const [initialDestinations, setInitialDestinations] = useState<
		AlertDestinationInput[]
	>([])
	const [destinations, setDestinations] = useState<AlertDestinationInput[]>(
		[],
	)

	useEffect(() => {
		if (productType === ProductType.Sessions) {
			// locked session settings -> group by secure_id
			setGroupByEnabled(true)
			setGroupByKey('secure_id')
			// only alert once per session
			setThresholdWindow(MINUTE)
			setThresholdCooldown(WEEK)
		} else if (productType === ProductType.Errors) {
			// locked error settings -> group by secure_id
			setGroupByEnabled(true)
			setGroupByKey('secure_id')
			setThresholdWindow(DEFAULT_WINDOW)
			setThresholdCooldown(DEFAULT_COOLDOWN)
		} else {
			setGroupByEnabled(false)
			setGroupByKey('')
			setThresholdWindow(DEFAULT_WINDOW)
			setThresholdCooldown(DEFAULT_COOLDOWN)
		}

		setBelowThreshold(false)
		setThresholdValue(DEFAULT_THRESHOLD)
		setQuery('')
		setFunctionType(MetricAggregator.Count)
		setFunctionColumn('')
	}, [productType])

	const onSave = () => {
		const formVariables = {
			project_id: projectId,
			name: alertName,
			product_type: productType,
			function_type: functionType,
			function_column:
				functionType === MetricAggregator.Count
					? undefined
					: functionColumn,
			query: query,
			group_by_key: groupByEnabled ? groupByKey : undefined,
			below_threshold: belowThreshold,
			threshold_value: thresholdValue,
			threshold_window: thresholdWindow,
			threshold_cooldown: thresholdCooldown,
			destinations,
		}

		if (isEdit) {
			updateAlert({
				variables: {
					alert_id: alert_id!,
					...formVariables,
				},
			})
				.then(() => {
					toast.success(`${alertName} updated`).then(() => {
						navigate(`/${projectId}/alerts`)
					})
				})
				.catch(() => {
					toast.error(`Failed to updated alert`)
				})
		} else {
			createAlert({
				variables: {
					...formVariables,
				},
			})
				.then(() => {
					toast.success(`${alertName} created`).then(() => {
						navigate(`/${projectId}/alerts`)
					})
				})
				.catch(() => {
					toast.error(`Failed to created alert`)
				})
		}
	}

	const onDelete = () => {
		if (!projectId || !alert_id) {
			return
		}

		deleteAlertMutation({
			variables: {
				project_id: projectId!,
				alert_id: alert_id!,
			},
		})
			.then((resp) => {
				if (resp.data?.deleteAlert) {
					toast.success(`Alert deleted!`)
					navigate(`/${projectId}/alerts`)
				} else {
					toast.error(`Failed to delete alert!`)
				}
			})
			.catch(() => {
				toast.error(`Failed to delete alert!`)
			})
	}

	const { loading: metaLoading } = useGetAlertQuery({
		variables: {
			id: alert_id!,
		},
		skip: !isEdit,
		onCompleted: (data) => {
			if (!data.alert) {
				return
			}

			setProductType(data.alert.product_type)
			setFunctionType(data.alert.function_type)
			setFunctionColumn(data.alert.function_column ?? '')
			setQuery(data.alert.query ?? '')
			setAlertName(data.alert.name)
			setGroupByEnabled(data.alert.group_by_key !== null)
			setGroupByKey(data.alert.group_by_key ?? '')

			// for threshold alerts
			setBelowThreshold(data.alert.below_threshold ?? false)
			setThresholdValue(data.alert.threshold_value ?? DEFAULT_THRESHOLD)
			setThresholdWindow(data.alert.threshold_window ?? DEFAULT_WINDOW)
			setThresholdCooldown(
				data.alert.threshold_cooldown ?? DEFAULT_COOLDOWN,
			)
			setInitialDestinations(
				data.alert.destinations as AlertDestinationInput[],
			)
			setDestinations(data.alert.destinations as AlertDestinationInput[])
		},
	})

	const searchOptionsConfig = useMemo(() => {
		return {
			productType,
			startDate,
			endDate,
		}
	}, [productType, startDate, endDate])

	if (metaLoading) {
		return null
	}

	const disableSave =
		createAlertContext.loading || updateAlertContext.loading || !alertName

	return (
		<>
			<Helmet>
				<title>{isEdit ? 'Edit' : 'Create'} Alert</title>
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
							{isEdit ? 'Edit' : 'Create'} alert
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
								onClick={() => navigate(`/${projectId}/alerts`)}
								trackingId="CancelAlert"
							>
								Cancel
							</Button>
							{isEdit && (
								<Button
									kind="danger"
									size="small"
									emphasis="low"
									onClick={onDelete}
									trackingId="DeleteAlert"
								>
									Delete Alert
								</Button>
							)}

							<Button
								disabled={disableSave}
								onClick={onSave}
								trackingId="SaveAlert"
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
						<AlertGraph
							alertName={alertName}
							query={query}
							productType={productType}
							functionColumn={functionColumn}
							functionType={functionType}
							groupByKey={groupByEnabled ? groupByKey : undefined}
							thresholdWindow={thresholdWindow}
							thresholdValue={thresholdValue}
							belowThreshold={belowThreshold}
							startDate={startDate}
							endDate={endDate}
							selectedPreset={selectedPreset}
							updateSearchTime={updateSearchTime}
						/>
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
											options={products}
											selection={productType}
											setSelection={setProductType}
											icons={productIcons}
										/>
									</LabeledRow>
									{ALERT_PRODUCT_INFO[productType] && (
										<Callout
											title={`${productType} alerts`}
										>
											<Box pb="8">
												<Text>
													{
														ALERT_PRODUCT_INFO[
															productType
														]
													}
												</Text>
											</Box>
										</Callout>
									)}
								</SidebarSection>
								<Divider className="m-0" />

								<SidebarSection>
									{!isSessionAlert && !isErrorAlert && (
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
													selection={functionColumn}
													setSelection={
														setFunctionColumn
													}
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
									)}
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
								{!isSessionAlert && (
									<>
										<SidebarSection>
											<LabeledRow
												label="Alert conditions"
												name="alertConditions"
											>
												<OptionDropdown<AlertCondition>
													options={
														ALERT_CONDITION_OPTIONS
													}
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
											<Stack direction="row" gap="12">
												<LabeledRow
													label="Alert threshold"
													name="thresholdValue"
												>
													<Input
														name="thresholdValue"
														type="number"
														value={thresholdValue}
														onChange={(e) => {
															setThresholdValue(
																Number(
																	e.target
																		.value,
																),
															)
														}}
													/>
												</LabeledRow>
												<LabeledRow
													label="Alert window"
													name="thresholdWindow"
												>
													<OptionDropdown<string>
														options={FREQUENCY_OPTIONS.map(
															(f) => f.value,
														)}
														labels={FREQUENCY_OPTIONS.map(
															(f) => f.name,
														)}
														selection={String(
															thresholdWindow,
														)}
														setSelection={(
															option,
														) => {
															setThresholdWindow(
																Number(option),
															)
														}}
													/>
												</LabeledRow>
											</Stack>
											<LabeledRow
												label="Cooldown"
												name="thresholdCooldown"
											>
												<OptionDropdown<string>
													options={FREQUENCY_OPTIONS.map(
														(f) => f.value,
													)}
													labels={FREQUENCY_OPTIONS.map(
														(f) => f.name,
													)}
													selection={String(
														thresholdCooldown,
													)}
													setSelection={(option) => {
														setThresholdCooldown(
															Number(option),
														)
													}}
												/>
											</LabeledRow>
										</SidebarSection>
										<Divider className="m-0" />
										{!isErrorAlert && (
											<>
												<SidebarSection>
													<LabeledRow
														label="Group by"
														name="groupBy"
														enabled={groupByEnabled}
														setEnabled={
															setGroupByEnabled
														}
														tooltip="A categorical field for grouping results into separate series."
													>
														<Combobox
															selection={
																groupByKey
															}
															setSelection={
																setGroupByKey
															}
															label="groupBy"
															searchConfig={
																searchOptionsConfig
															}
														/>
													</LabeledRow>
												</SidebarSection>
												<Divider className="m-0" />
											</>
										)}
									</>
								)}
								<SidebarSection>
									<DestinationInput
										initialDestinations={
											initialDestinations
										}
										setDestinations={setDestinations}
									/>
								</SidebarSection>
							</Form>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}
