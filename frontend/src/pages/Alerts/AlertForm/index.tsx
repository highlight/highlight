import {
	Box,
	Button,
	Callout,
	DateRangePicker,
	DEFAULT_TIME_PRESETS,
	Form,
	IconSolidBell,
	IconSolidCheveronRight,
	Input,
	presetStartDate,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { Divider } from 'antd'
import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { toast } from '@components/Toaster'
import { useParams } from '@util/react-router/useParams'
import { SearchContext } from '@/components/Search/SearchContext'
import { Search } from '@/components/Search/SearchForm/SearchForm'
import {
	GetAlertDocument,
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
	ThresholdCondition,
	ThresholdType,
} from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { FREQUENCIES } from '@/pages/Alerts/AlertConfigurationCard/AlertConfigurationConstants'
import {
	getThresholdConditionOptions,
	THRESHOLD_TYPE_OPTIONS,
} from '@/pages/Alerts/constants'
import { DestinationInput } from '@/pages/Alerts/DestinationInput'
import { Combobox } from '@/pages/Graphing/Combobox'
import {
	Editor,
	EDITOR_OPTIONS,
	FUNCTION_TYPES,
	PRODUCT_OPTIONS,
} from '@/pages/Graphing/constants'
import { HeaderDivider } from '@/pages/Graphing/Dashboard'
import { LabeledRow } from '@/pages/Graphing/LabeledRow'
import { OptionDropdown } from '@/pages/Graphing/OptionDropdown'
import { EventSelection } from '@/pages/Graphing/EventSelection'
import { GraphContextProvider } from '@/pages/Graphing/context/GraphContext'
import { useGraphData } from '@pages/Graphing/hooks/useGraphData'
import { useGraphTime } from '@/pages/Graphing/hooks/useGraphTime'
import {
	DEFAULT_ALERT_SQL,
	SqlEditor,
} from '@/pages/Graphing/components/SqlEditor'
import { Panel } from '@/pages/Graphing/components/Panel'
import { GraphBackgroundWrapper } from '@/pages/Graphing/GraphingEditor'
import { atobSafe, btoaSafe } from '@/util/string'

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

const CONFIDENCE_OPTIONS = [
	{
		name: '80%',
		id: '80%',
		value: 0.8,
	},
	{
		name: '90%',
		id: '90%',
		value: 0.9,
	},
	{
		name: '95%',
		id: '95%',
		value: 0.95,
	},
	{
		name: '99%',
		id: '99%',
		value: 0.99,
	},
]

const MINUTE = 60
const WEEK = 7 * 24 * 60 * MINUTE

export const SESSION_WINDOW = MINUTE
export const SESSION_COOLDOWN = WEEK

export const DEFAULT_THRESHOLD = 1
export const DEFAULT_WINDOW = MINUTE * 30
export const DEFAULT_COOLDOWN = MINUTE * 30
export const DEFAULT_THRESHOLD_CONDITON = ThresholdCondition.Above
export const DEFAULT_THRESHOLD_TYPE = ThresholdType.Constant
export const DEFAULT_CONFIDENCE_OPTION = CONFIDENCE_OPTIONS[1]

export const SETTINGS_PARAM = 'settings'

export type AlertSettings = {
	productType: ProductType
	functionType: MetricAggregator
	functionColumn: string
	query: string
	alertName: string
	groupByEnabled: boolean
	groupByKey: string
	thresholdValue: number
	thresholdCondition: ThresholdCondition
	thresholdType: ThresholdType
	thresholdWindow: number
	thresholdCooldown: number
	destinations: AlertDestinationInput[]
	editor: Editor
	sql?: string
}

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
	const graphContext = useGraphData()
	const { alert_id } = useParams<{
		alert_id: string
	}>()
	const [searchParams, setSearchParams] = useSearchParams()

	const isEdit = alert_id !== undefined

	const { startDate, endDate, selectedPreset, updateSearchTime } =
		useGraphTime(DEFAULT_TIME_PRESETS)

	const [createAlert, createAlertContext] = useCreateAlertMutation({
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})
	const [updateAlert, updateAlertContext] = useUpdateAlertMutation({
		refetchQueries: [
			{
				query: GetAlertDocument,
				variables: {
					id: alert_id!,
				},
			},
			namedOperations.Query.GetAlertsPagePayload,
		],
	})
	const [deleteAlertMutation] = useDeleteAlertMutation({
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})

	const navigate = useNavigate()

	const settingsParam = searchParams.get(SETTINGS_PARAM)
	const [initialSettings] = useState(
		settingsParam !== null
			? (JSON.parse(atobSafe(settingsParam)) as AlertSettings)
			: undefined,
	)

	const [editor, setEditorImpl] = useState(
		initialSettings?.editor ?? Editor.QueryBuilder,
	)
	const setEditor = (e: Editor) => {
		if (e === Editor.SqlEditor) {
			setThresholdType(ThresholdType.Constant)
		}
		handleProductChange(ProductType.Logs)
		setEditorImpl(e)
	}

	const [sqlInternal, setSqlInternal] = useState(
		initialSettings?.sql ?? DEFAULT_ALERT_SQL,
	)
	const [sql, setSql] = useState(sqlInternal)

	const [alertName, setAlertName] = useState(initialSettings?.alertName ?? '')
	const [productType, setProductType] = useState(
		(searchParams.get('source') as ProductType) ||
			initialSettings?.productType ||
			PRODUCT_OPTIONS[0].value,
	)
	const [functionType, setFunctionType] = useState(
		initialSettings?.functionType ?? MetricAggregator.Count,
	)
	const [functionColumn, setFunctionColumn] = useState(
		initialSettings?.functionColumn ?? '',
	)
	const fetchedFunctionColumn = useMemo(() => {
		return functionType === MetricAggregator.Count ? '' : functionColumn
	}, [functionColumn, functionType])

	const isErrorAlert = productType === ProductType.Errors
	const isSessionAlert = productType === ProductType.Sessions

	const [query, setQuery] = useState(
		initialSettings?.query ?? searchParams.get('query') ?? '',
	)

	const [groupByEnabled, setGroupByEnabled] = useState(
		initialSettings?.groupByEnabled ?? false,
	)
	const [groupByKey, setGroupByKey] = useState(
		initialSettings?.groupByKey ?? '',
	)

	const [thresholdType, setThresholdTypeImpl] = useState(
		initialSettings?.thresholdType ?? DEFAULT_THRESHOLD_TYPE,
	)
	const setThresholdType = (value: ThresholdType) => {
		if (value === thresholdType) {
			return
		}

		if (value === ThresholdType.Anomaly) {
			setThresholdValue(DEFAULT_CONFIDENCE_OPTION.value)
		} else if (value === ThresholdType.Constant) {
			setThresholdValue(DEFAULT_THRESHOLD)

			// errors and sessions are currently only grouped by secure_id
			if (
				productType === ProductType.Sessions ||
				productType === ProductType.Errors
			) {
				setGroupByEnabled(true)
				setGroupByKey('secure_id')
			}
		}

		setThresholdTypeImpl(value)
	}
	const [thresholdCondition, setThresholdCondition] = useState(
		initialSettings?.thresholdCondition ?? DEFAULT_THRESHOLD_CONDITON,
	)
	const isAnomaly = thresholdType === ThresholdType.Anomaly

	const [thresholdValue, setThresholdValue] = useState(
		initialSettings?.thresholdValue ?? DEFAULT_THRESHOLD,
	)
	const [thresholdWindow, setThresholdWindow] = useState(
		initialSettings?.thresholdWindow ?? DEFAULT_WINDOW,
	)
	const [thresholdCooldown, setThresholdCooldown] = useState<number>(
		initialSettings?.thresholdCooldown ?? DEFAULT_COOLDOWN,
	)

	const [initialDestinations, setInitialDestinations] = useState<
		AlertDestinationInput[]
	>(initialSettings?.destinations ?? [])
	const [destinations, setDestinations] = useState<AlertDestinationInput[]>(
		initialSettings?.destinations ?? [],
	)

	const handleProductChange = (product: ProductType) => {
		if (product === productType) {
			return
		}

		if (
			productType !== ProductType.Metrics &&
			product === ProductType.Metrics
		) {
			setFunctionType(MetricAggregator.Avg)
			setFunctionColumn('value')
		} else {
			setFunctionType(MetricAggregator.Count)
			setFunctionColumn('')
		}

		setProductType(product)
		if (product === ProductType.Sessions && !isAnomaly) {
			// locked session settings -> group by secure_id
			setGroupByEnabled(true)
			setGroupByKey('secure_id')
			// only alert once per session
			setThresholdWindow(SESSION_WINDOW)
			setThresholdCooldown(SESSION_COOLDOWN)
		} else if (product === ProductType.Errors && !isAnomaly) {
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

		setThresholdCondition(DEFAULT_THRESHOLD_CONDITON)
		setThresholdValue(DEFAULT_THRESHOLD)
		setQuery('')
	}

	const redirectToAlert = (id?: string) => {
		const redirectId = id || alert_id
		navigate(`/${projectId}/alerts/${redirectId}`)
	}

	const redirectToAlerts = () => {
		navigate(`/${projectId}/alerts`)
	}

	const settings: AlertSettings = {
		productType,
		functionType,
		functionColumn,
		query,
		alertName,
		groupByEnabled,
		groupByKey,
		thresholdValue,
		thresholdCondition,
		thresholdType,
		thresholdWindow,
		thresholdCooldown,
		destinations,
		editor,
		sql,
	}

	const settingsEncoded = btoaSafe(JSON.stringify(settings))

	useEffect(() => {
		searchParams.set(SETTINGS_PARAM, settingsEncoded)
		setSearchParams(Object.fromEntries(searchParams.entries()), {
			replace: true,
		})
	}, [searchParams, setSearchParams, settingsEncoded])

	const onSave = () => {
		const formVariables = {
			project_id: projectId,
			name: alertName,
			product_type: productType,
			function_type: functionType,
			function_column: fetchedFunctionColumn || undefined,
			query: query,
			group_by_key: groupByEnabled ? groupByKey : undefined,
			threshold_value: thresholdValue,
			threshold_window: thresholdWindow,
			threshold_cooldown: thresholdCooldown,
			threshold_type: thresholdType,
			threshold_condition: thresholdCondition,
			destinations,
			sql: editor === Editor.SqlEditor ? sql : undefined,
		}

		console.log('vars', formVariables)

		if (isEdit) {
			updateAlert({
				variables: {
					alert_id: alert_id!,
					...formVariables,
				},
			})
				.then(() => {
					toast.success(`${alertName} updated`).then(() => {
						redirectToAlert()
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
				.then((response) => {
					toast.success(`${alertName} created`).then(() => {
						redirectToAlert(response?.data?.createAlert?.id)
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
			if (!data.alert || initialSettings !== undefined) {
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
			setThresholdValue(data.alert.threshold_value ?? DEFAULT_THRESHOLD)
			setThresholdWindow(data.alert.threshold_window ?? DEFAULT_WINDOW)
			setThresholdCooldown(
				data.alert.threshold_cooldown ?? DEFAULT_COOLDOWN,
			)
			setThresholdType(
				data.alert.threshold_type ?? DEFAULT_THRESHOLD_TYPE,
			)
			setThresholdCondition(
				data.alert.threshold_condition ?? DEFAULT_THRESHOLD_CONDITON,
			)
			setInitialDestinations(
				data.alert.destinations as AlertDestinationInput[],
			)
			setDestinations(data.alert.destinations as AlertDestinationInput[])
			setSql(data.alert.sql ?? '')
			setEditor(data.alert.sql ? Editor.SqlEditor : Editor.QueryBuilder)
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
		<GraphContextProvider value={graphContext}>
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
						<Box
							alignItems="center"
							display="flex"
							gap="4"
							color="weak"
							flexWrap="nowrap"
						>
							<Tag
								shape="basic"
								kind="secondary"
								lines="1"
								iconLeft={<IconSolidBell />}
								onClick={redirectToAlerts}
							>
								Alerts
							</Tag>
							<IconSolidCheveronRight />
							<Text size="small" weight="medium" color="default">
								{isEdit ? 'Edit' : 'Create'} alert
							</Text>
						</Box>
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
								disabled={editor === Editor.SqlEditor}
							/>
							<HeaderDivider />
							<Button
								emphasis="low"
								kind="secondary"
								onClick={() => {
									navigate(-1)
								}}
							>
								Cancel
							</Button>
							{isEdit && (
								<Button
									kind="danger"
									size="small"
									emphasis="low"
									onClick={onDelete}
								>
									Delete alert
								</Button>
							)}

							<Button disabled={disableSave} onClick={onSave}>
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
							flexDirection="column"
							justifyContent="space-between"
							cssClass={style.editGraphPreview}
						>
							<GraphBackgroundWrapper>
								<AlertGraph
									alertName={alertName}
									query={query}
									productType={productType}
									functionColumn={fetchedFunctionColumn}
									functionType={functionType}
									groupByKey={
										groupByEnabled ? groupByKey : undefined
									}
									thresholdWindow={thresholdWindow}
									thresholdValue={thresholdValue}
									thresholdType={thresholdType}
									thresholdCondition={thresholdCondition}
									startDate={startDate}
									endDate={endDate}
									updateSearchTime={updateSearchTime}
									sql={
										editor === Editor.SqlEditor
											? sql
											: undefined
									}
								/>
							</GraphBackgroundWrapper>
						</Box>
						<Panel>
							<Form>
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
									<Box cssClass={style.editorSection}>
										<Box cssClass={style.editorHeader}>
											<Box cssClass={style.editorSelect}>
												<OptionDropdown<Editor>
													options={EDITOR_OPTIONS}
													selection={settings.editor}
													setSelection={setEditor}
												/>
											</Box>
											{settings.editor ===
												Editor.SqlEditor && (
												<Button
													disabled={
														sqlInternal === sql
													}
													onClick={() => {
														setSql(sqlInternal)
													}}
												>
													Update query
												</Button>
											)}
										</Box>
										{settings.editor ===
											Editor.SqlEditor && (
											<Box
												cssClass={
													style.sqlEditorWrapper
												}
											>
												<SqlEditor
													value={sqlInternal}
													setValue={setSqlInternal}
													startDate={startDate}
													endDate={endDate}
												/>
											</Box>
										)}
										{settings.editor ===
											Editor.QueryBuilder && (
											<>
												<SidebarSection>
													<LabeledRow
														label="Source"
														name="source"
														tooltip="The resource being queried, one of the five highlight.io resources."
													>
														<OptionDropdown
															options={
																PRODUCT_OPTIONS
															}
															selection={
																productType
															}
															setSelection={
																handleProductChange
															}
														/>
													</LabeledRow>
													{!isAnomaly &&
														ALERT_PRODUCT_INFO[
															productType
														] && (
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
													{productType ===
													ProductType.Events ? (
														<EventSelection
															initialQuery={query}
															setQuery={setQuery}
															startDate={
																startDate
															}
															endDate={endDate}
														/>
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
																	initialQuery={
																		query
																	}
																	onSubmit={
																		setQuery
																	}
																>
																	<Search
																		startDate={
																			new Date(
																				startDate,
																			)
																		}
																		endDate={
																			new Date(
																				endDate,
																			)
																		}
																		productType={
																			productType
																		}
																		hideIcon
																	/>
																</SearchContext>
															</Box>
														</LabeledRow>
													)}
												</SidebarSection>
												{(isAnomaly ||
													(!isSessionAlert &&
														!isErrorAlert)) && (
													<>
														<Box px="12">
															<Divider className="m-0" />
														</Box>
														<SidebarSection>
															<LabeledRow
																label="Function"
																name="function"
																tooltip="Determines how data points are aggregated. If the function requires a numeric field as input, one can be chosen."
															>
																<OptionDropdown
																	key={
																		functionType
																	}
																	options={
																		FUNCTION_TYPES
																	}
																	selection={
																		functionType
																	}
																	setSelection={
																		setFunctionType
																	}
																/>
																<Combobox
																	key={
																		fetchedFunctionColumn
																	}
																	selection={
																		fetchedFunctionColumn
																	}
																	setSelection={
																		setFunctionColumn
																	}
																	searchConfig={
																		searchOptionsConfig
																	}
																	disabled={
																		functionType ===
																		MetricAggregator.Count
																	}
																	onlyNumericKeys={
																		functionType !==
																		MetricAggregator.CountDistinct
																	}
																/>
															</LabeledRow>
															<LabeledRow
																label="Group by"
																name="groupBy"
																enabled={
																	groupByEnabled
																}
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
																	searchConfig={
																		searchOptionsConfig
																	}
																/>
															</LabeledRow>
														</SidebarSection>
													</>
												)}
											</>
										)}
									</Box>
								</SidebarSection>
								<Divider className="m-0" />
								<SidebarSection>
									<LabeledRow
										label="Alert threshold type"
										name="alertType"
									>
										<OptionDropdown<ThresholdType>
											options={THRESHOLD_TYPE_OPTIONS}
											selection={thresholdType}
											setSelection={setThresholdType}
											disabled={
												editor === Editor.SqlEditor
											}
										/>
									</LabeledRow>
									{(isAnomaly || !isSessionAlert) && (
										<>
											<LabeledRow
												label="Alert conditions"
												name="alertConditions"
											>
												<OptionDropdown<ThresholdCondition>
													options={getThresholdConditionOptions(
														thresholdType,
													)}
													selection={
														thresholdCondition
													}
													setSelection={
														setThresholdCondition
													}
												/>
											</LabeledRow>
											<Stack direction="row" gap="12">
												{isAnomaly && (
													<LabeledRow
														label="Alert threshold"
														name="thresholdValue"
													>
														<OptionDropdown
															options={
																CONFIDENCE_OPTIONS
															}
															selection={String(
																thresholdValue,
															)}
															setSelection={(
																option,
															) => {
																setThresholdValue(
																	Number(
																		option,
																	),
																)
															}}
														/>
													</LabeledRow>
												)}
												{!isAnomaly && (
													<LabeledRow
														label="Alert threshold"
														name="thresholdValue"
													>
														<Input
															name="thresholdValue"
															type="number"
															value={
																thresholdValue
															}
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
												)}
												<LabeledRow
													label="Alert window"
													name="thresholdWindow"
												>
													<OptionDropdown
														options={
															FREQUENCY_OPTIONS
														}
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
												<OptionDropdown
													options={FREQUENCY_OPTIONS}
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
										</>
									)}
								</SidebarSection>
								<Divider className="m-0" />
								<SidebarSection>
									<DestinationInput
										initialDestinations={
											initialDestinations
										}
										setDestinations={setDestinations}
									/>
								</SidebarSection>
							</Form>
						</Panel>
					</Box>
				</Box>
			</Box>
		</GraphContextProvider>
	)
}
