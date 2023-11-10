import { Button } from '@components/Button'
import { TIME_FORMAT } from '@components/Search/SearchForm/constants'
import { SearchForm } from '@components/Search/SearchForm/SearchForm'
import { useGetBaseSearchContext } from '@context/SearchState'
import {
	useEditProjectSettingsMutation,
	useGetBillingDetailsForProjectQuery,
	useGetLogsKeysQuery,
	useGetLogsKeyValuesLazyQuery,
	useGetProjectSettingsQuery,
	useGetTracesKeysQuery,
	useGetTracesKeyValuesLazyQuery,
	useGetTracesMetricsQuery,
	useGetWorkspaceSettingsQuery,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import {
	MetricAggregator,
	PlanType,
	ProductType,
	Sampling,
	TracesMetricColumn,
} from '@graph/schemas'
import {
	Badge,
	Box,
	Callout,
	defaultPresets,
	Form,
	getNow,
	Heading,
	IconSolidCheveronRight,
	IconSolidPencil,
	PreviousDateRangePicker,
	Stack,
	Tag,
	Text,
	Tooltip,
	useFormStore,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { ErrorSearchContextProvider } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import ErrorQueryBuilder, {
	CUSTOM_FIELDS as ERROR_CUSTOM_FIELDS,
	TIME_RANGE_FIELD as ERROR_TIME_RANGE_FIELD,
} from '@pages/ErrorsV2/ErrorQueryBuilder/ErrorQueryBuilder'
import LogsHistogram from '@pages/LogsPage/LogsHistogram/LogsHistogram'
import { SearchContextProvider } from '@pages/Sessions/SearchContext/SearchContext'
import SessionQueryBuilder, {
	CUSTOM_FIELDS,
	TIME_RANGE_FIELD,
} from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/SessionQueryBuilder'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { buildQueryStateString } from '@util/url/params'
import { showSupportMessage } from '@util/window'
import { message } from 'antd'
import _, { upperFirst } from 'lodash'
import moment from 'moment'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Header: React.FC<{
	product: ProductType
	title: string
}> = ({ title, product }) => {
	const navigate = useNavigate()
	const { projectId } = useProjectId()
	const breadcrumbs = [
		{
			path: `/${projectId}/settings/filters`,
			label: 'Filters',
		},
		{
			path: `/${projectId}/settings/filters/${product}`,
			label: upperFirst(product.slice(0, -1)),
		},
	]

	return (
		<>
			<Stack direction="row" align="center" gap="4">
				{breadcrumbs.map((breadcrumb, index) => (
					<Stack gap="6" direction="row" align="center" key={index}>
						{index > 0 && <IconSolidCheveronRight />}
						{index < breadcrumbs.length - 1 ? (
							<Tag
								kind="secondary"
								emphasis="low"
								shape="basic"
								onClick={() =>
									navigate(breadcrumb.path, { replace: true })
								}
							>
								{breadcrumb.label}
							</Tag>
						) : (
							<Badge
								kind="white"
								label={breadcrumb.label}
								size="medium"
							/>
						)}
					</Stack>
				))}
			</Stack>
			<Heading mt="16" mb="24">
				{title}
			</Heading>
		</>
	)
}

export const ProjectFilters: React.FC = () => {
	return (
		<Stack width="full">
			<ProjectProductFilters view product={ProductType.Sessions} />
			<Box my="20" borderBottom="dividerWeak" />
			<ProjectProductFilters view product={ProductType.Errors} />
			<Box my="20" borderBottom="dividerWeak" />
			<ProjectProductFilters view product={ProductType.Logs} />
			<Box my="20" borderBottom="dividerWeak" />
			<ProjectProductFilters view product={ProductType.Traces} />
		</Stack>
	)
}

interface DateRange {
	start: Date
	end: Date
}

export const ProjectProductFilters: React.FC<{
	product: ProductType
	view?: boolean
}> = ({ product, view }) => {
	const { projectId } = useProjectId()
	const navigate = useNavigate()
	const { currentWorkspace } = useApplicationContext()
	const [dateRange, setDateRange] = React.useState<DateRange>({
		start: defaultPresets[1].startDate,
		end: getNow().toDate(),
	})
	const { data, loading } = useGetProjectSettingsQuery({
		variables: {
			projectId: projectId!,
		},
		skip: !projectId,
	})
	const { data: workspaceSettingsData } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: String(currentWorkspace?.id) },
		skip: !currentWorkspace?.id,
	})
	const { data: billingDetails } = useGetBillingDetailsForProjectQuery({
		variables: { project_id: projectId! },
		skip: !projectId,
	})
	const [editProjectSettingsMutation, { loading: saveLoading }] =
		useEditProjectSettingsMutation({
			refetchQueries: [namedOperations.Query.GetProjectSettings],
		})

	const sessionSearchContext = useGetBaseSearchContext(
		'sessions',
		`{"isAnd":true,"rules":[]}`,
		'highlightSegmentPickerForProjectFilterSessionsSelectedSegmentId',
		CUSTOM_FIELDS,
		TIME_RANGE_FIELD,
	)
	const { searchQuery, setSearchQuery } = sessionSearchContext
	const errorSearchContext = useGetBaseSearchContext(
		'errors',
		`{"isAnd":true,"rules":[]}`,
		'highlightSegmentPickerForProjectFilterErrorsSelectedSegmentId',
		ERROR_CUSTOM_FIELDS,
		ERROR_TIME_RANGE_FIELD,
	)
	const [searchResultSecureIds, setSearchResultSecureIds] = useState<
		string[]
	>([])
	const {
		searchQuery: errorSearchQuery,
		setSearchQuery: setErrorSearchQuery,
	} = errorSearchContext

	const formStore = useFormStore<{
		samplingPercent: number
		minuteRateLimit: number | null
		exclusionQuery: string | null
	}>({
		defaultValues: {
			samplingPercent: 100,
			exclusionQuery: null,
			minuteRateLimit: null,
		},
	})

	const canEditIngestion =
		billingDetails?.billingDetailsForProject?.plan.type !== PlanType.Free
	const canEditSampling =
		workspaceSettingsData?.workspaceSettings?.enable_ingest_sampling

	const showEditIngestionUpgrade = React.useCallback(async () => {
		analytics.track('Project Ingestion Upgrade', {
			product,
			workspaceId: currentWorkspace?.id,
		})
		await message.warn(
			'Setting up ingest filters is only available on paying plans.',
			3,
		)
		navigate(`/w/${currentWorkspace?.id}/current-plan/update-plan`)
	}, [currentWorkspace?.id, navigate, product])

	const showEditSamplingUpgrade = React.useCallback(async () => {
		analytics.track('Project Sampling Upgrade', {
			product,
			workspaceId: currentWorkspace?.id,
		})
		await message.warn(
			'Setting up ingest sampling is only available on enterprise plans.',
		)
		showSupportMessage(
			'Hi! I would like to use the ingest sampling feature.',
		)
	}, [currentWorkspace?.id, product])

	const resetConfig = React.useCallback(() => {
		const c = {
			exclusion_query:
				data?.projectSettings?.sampling[
					`${product
						.toLowerCase()
						.slice(0, -1)}_exclusion_query` as keyof Pick<
						Sampling,
						| 'session_exclusion_query'
						| 'error_exclusion_query'
						| 'log_exclusion_query'
						| 'trace_exclusion_query'
					>
				],
			sampling_rate:
				data?.projectSettings?.sampling[
					`${product
						.toLowerCase()
						.slice(0, -1)}_sampling_rate` as keyof Pick<
						Sampling,
						| 'session_sampling_rate'
						| 'error_sampling_rate'
						| 'log_sampling_rate'
						| 'trace_sampling_rate'
					>
				],
			minute_rate_limit:
				data?.projectSettings?.sampling[
					`${product
						.toLowerCase()
						.slice(0, -1)}_minute_rate_limit` as keyof Pick<
						Sampling,
						| 'session_minute_rate_limit'
						| 'error_minute_rate_limit'
						| 'log_minute_rate_limit'
						| 'trace_minute_rate_limit'
					>
				],
		}
		formStore.setValues({
			samplingPercent: 100 * (c?.sampling_rate ?? 1),
			exclusionQuery: c?.exclusion_query ?? null,
			minuteRateLimit: c?.minute_rate_limit ?? null,
		})

		// TODO(vkorolik) exclusion query logic is not robust to operators and frontend types
		if (
			product === ProductType.Sessions ||
			product === ProductType.Errors
		) {
			const params = {} as { [key: string]: string }
			for (const pair of (c?.exclusion_query ?? '').split(' ')) {
				const [key, value] = pair.split(':')
				if (key && value) {
					params[
						`${product.toLowerCase().slice(0, -1)}_${key}`
					] = `is:${value}`
				}
			}
			;(product === ProductType.Sessions
				? setSearchQuery
				: setErrorSearchQuery)(buildQueryStateString(params))
		}
	}, [
		data?.projectSettings?.sampling,
		formStore,
		product,
		setErrorSearchQuery,
		setSearchQuery,
	])

	React.useEffect(() => {
		// TODO(vkorolik) exclusion query logic is not robust to operators and frontend types
		const rules = []
		if (
			product === ProductType.Sessions ||
			product === ProductType.Errors
		) {
			for (const [key, _, v] of JSON.parse(
				product === ProductType.Sessions
					? searchQuery
					: product === ProductType.Errors
					? errorSearchQuery
					: JSON.stringify({ rules: [] }),
			).rules) {
				const [type, k] = key.split(/_(.*)/s)
				if (product === ProductType.Sessions && type !== 'session')
					continue
				if (product === ProductType.Errors && type !== 'error-field')
					continue
				if (product === ProductType.Errors && k === 'timestamp')
					continue
				if (v.indexOf(' ') !== -1) {
					rules.push(`${k}:"${v}"`)
				} else {
					rules.push(`${k}:${v}`)
				}
			}
		}
		formStore.setValue('exclusionQuery', rules.join(' '))
	}, [errorSearchQuery, formStore, product, searchQuery])

	React.useEffect(resetConfig, [resetConfig])

	if (!product || loading) {
		return null
	}

	const label = upperFirst(product.slice(0, -1))
	const onSave = async () => {
		const sampling = {
			[`${product.toLowerCase().slice(0, -1)}_exclusion_query`]:
				formStore.getValue('exclusionQuery') || undefined,
			[`${product.toLowerCase().slice(0, -1)}_sampling_rate`]:
				formStore.getValue('samplingPercent') / 100,
			[`${product.toLowerCase().slice(0, -1)}_minute_rate_limit`]:
				formStore.getValue('minuteRateLimit'),
		}
		await editProjectSettingsMutation({
			variables: {
				projectId,
				sampling,
			},
		})
		await new Promise((r) => setTimeout(r, 1000))
		navigate(`/${projectId}/settings/filters`)
	}

	const sampling = (
		<Box
			display="flex"
			width="full"
			gap="8"
			onClick={canEditSampling ? undefined : showEditSamplingUpgrade}
		>
			<Box width="full" display="flex" flexDirection="column" gap="4">
				<Form.Label
					label="Sampling %"
					name={formStore.names.samplingPercent}
				/>
				<Form.Input
					disabled={!canEditSampling}
					name={formStore.names.samplingPercent}
					type="number"
				/>
			</Box>
			<Box width="full" display="flex" flexDirection="column" gap="4">
				<Form.Label
					label="Max ingest per minute"
					name={formStore.names.minuteRateLimit}
				/>
				<Form.Input
					disabled={!canEditSampling}
					name={formStore.names.minuteRateLimit}
					type="number"
				/>
			</Box>
		</Box>
	)

	const edit = (
		<Button
			trackingId={`project-filters-${product}-edit`}
			kind="secondary"
			size="small"
			emphasis="medium"
			iconRight={<IconSolidPencil />}
			disabled={!canEditIngestion}
			onClick={async () => {
				navigate(product.toLowerCase())
			}}
		>
			Edit
		</Button>
	)

	return (
		<Box width="full">
			{view ? null : (
				<Header product={product} title={`${label} filters`} />
			)}
			<Box display="flex" flexDirection="column" gap="6">
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
					width="full"
				>
					<Text>{label} filters</Text>
					{view ? null : (
						<Box display="flex" alignItems="center" gap="6">
							<Button
								trackingId={`project-filters-${product}-discard`}
								kind="secondary"
								size="small"
								emphasis="low"
								onClick={resetConfig}
							>
								Discard changes
							</Button>
							<Button
								trackingId={`project-filters-${product}-save`}
								kind="primary"
								size="small"
								emphasis="high"
								onClick={onSave}
								loading={saveLoading}
							>
								Save changes
							</Button>
						</Box>
					)}
				</Box>
				<Stack gap="6" py="6">
					<Box display="flex" width="full" gap="6">
						<Box width="full" style={{ minHeight: 20 }}>
							{product === ProductType.Logs ||
							product === ProductType.Traces ? (
								<SearchForm
									initialQuery={
										formStore.getValue('exclusionQuery') ??
										''
									}
									onFormSubmit={(value: string) => {
										formStore.setValue(
											'exclusionQuery',
											value,
										)
									}}
									disableSearch={view}
									hideDatePicker
									hideCreateAlert
									startDate={dateRange.start}
									endDate={dateRange.end}
									onDatesChange={() => {}}
									presets={defaultPresets}
									minDate={defaultPresets[5].startDate}
									timeMode="fixed-range"
									fetchKeys={
										product === ProductType.Logs
											? useGetLogsKeysQuery
											: useGetTracesKeysQuery
									}
									fetchValuesLazyQuery={
										product === ProductType.Logs
											? useGetLogsKeyValuesLazyQuery
											: useGetTracesKeyValuesLazyQuery
									}
								/>
							) : product === ProductType.Sessions ? (
								<SearchContextProvider
									value={sessionSearchContext}
								>
									<SessionQueryBuilder
										minimal
										readonly={view}
										setDefault={false}
									/>
								</SearchContextProvider>
							) : (
								<ErrorSearchContextProvider
									value={{
										...errorSearchContext,
										searchResultSecureIds,
										setSearchResultSecureIds,
									}}
								>
									<ErrorQueryBuilder
										minimal
										readonly={view}
										setDefault={false}
									/>
								</ErrorSearchContextProvider>
							)}
						</Box>
						{view ? (
							canEditIngestion ? (
								edit
							) : (
								<Tooltip
									trigger={
										<Box
											display="inline-flex"
											onClick={showEditIngestionUpgrade}
										>
											{edit}
										</Box>
									}
								>
									<Box
										display="flex"
										alignItems="center"
										justifyContent="center"
									>
										<Box
											display="flex"
											alignItems="center"
											justifyContent="center"
											p="4"
											onClick={showEditIngestionUpgrade}
										>
											<Text>
												Available to paid customers
											</Text>
										</Box>
									</Box>
								</Tooltip>
							)
						) : null}
					</Box>
					{view ? (
						<Box display="flex" alignItems="center" gap="4">
							<Tag shape="basic" kind="secondary" emphasis="high">
								Sampling:{' '}
								{formStore
									.getValue('samplingPercent')
									.toLocaleString()}
								%
							</Tag>
							<Tag shape="basic" kind="secondary" emphasis="high">
								Max ingest:{' '}
								{formStore.getValue('minuteRateLimit')
									? `${formStore
											.getValue('minuteRateLimit')
											.toLocaleString()} / minute`
									: 'Unlimited'}
							</Tag>
						</Box>
					) : null}
				</Stack>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					width="full"
				>
					<Text weight="medium" size="xSmall" color="weak">
						{label}s
					</Text>
					<PreviousDateRangePicker
						selectedDates={[dateRange.start, dateRange.end]}
						onDatesChange={(dates) =>
							setDateRange({
								start: dates[0],
								end: dates[1],
							})
						}
						presets={[defaultPresets[1], defaultPresets[3]]}
						noCustom
						minDate={defaultPresets[5].startDate}
						kind="secondary"
						size="medium"
						emphasis="low"
					/>
				</Box>
				<Box display="flex" width="full">
					<IngestTimeline product={product} dateRange={dateRange} />
				</Box>
				<Form store={formStore}>
					<Box display="flex" width="full">
						{view ? null : (
							<Stack display="flex" width="full" gap="8">
								{canEditSampling ? (
									sampling
								) : (
									<Tooltip trigger={sampling}>
										<Box
											display="flex"
											alignItems="center"
											justifyContent="center"
											p="4"
											onClick={showEditSamplingUpgrade}
										>
											<Text>
												Available to customers on an
												enterprise plan
											</Text>
										</Box>
									</Tooltip>
								)}
								<Callout>
									<Box
										display="flex"
										flexDirection="column"
										gap="12"
										py="6"
									>
										<Text color="moderate">
											1. Filters will drop data matching
											the condition.
										</Text>
										<Text color="moderate">
											2. Sampling % will determine the
											percentage of data to ingest.
										</Text>
										<Text color="moderate">
											3. Minute rate limit will drop a
											spike of data exceeding the
											per-minute value.
										</Text>
									</Box>
								</Callout>
							</Stack>
						)}
					</Box>
				</Form>
			</Box>
		</Box>
	)
}

const IngestTimeline: React.FC<{
	product: ProductType
	dateRange: DateRange
}> = ({ product, dateRange }) => {
	const { projectId } = useProjectId()
	const { data, loading } = useGetTracesMetricsQuery({
		variables: {
			project_id: projectId,
			column: TracesMetricColumn.Duration,
			metric_types: [MetricAggregator.CountDistinctKey],
			group_by: ['ingested'],
			params: {
				query: `span_name:IsIngestedBy product:${product}`,
				date_range: {
					start_date: moment(dateRange.start).format(TIME_FORMAT),
					end_date: moment(dateRange.end).format(TIME_FORMAT),
				},
			},
		},
	})

	const groupedByBucket = _.groupBy(
		data?.traces_metrics.buckets,
		(i) => i.bucket_id,
	)

	const histogramBuckets = data?.traces_metrics.buckets.map((b) => ({
		bucketId: b.bucket_id,
		group: b.group,
		counts: [
			{
				level: 'Ingested',
				count:
					(100 *
						(groupedByBucket[b.bucket_id][0]?.metric_value ?? 0)) /
					((groupedByBucket[b.bucket_id][0]?.metric_value ?? 0) +
						(groupedByBucket[b.bucket_id][1]?.metric_value ?? 0)),
				unit: '%',
			},
		],
	}))

	if (!loading && !data?.traces_metrics.buckets?.length) {
		return (
			<Box
				display="flex"
				alignItems="center"
				justifyContent="center"
				width="full"
				height="full"
			>
				<Tag shape="basic" size="large" kind="secondary" emphasis="low">
					No {product?.toLocaleLowerCase()} ingested.
				</Tag>
			</Box>
		)
	}

	return (
		<Box width="full" height="full">
			<LogsHistogram
				startDate={dateRange.start}
				endDate={dateRange.end}
				onDatesChange={() => {}}
				histogramBuckets={histogramBuckets}
				bucketCount={data?.traces_metrics.bucket_count}
				loading={loading}
				loadingState="spinner"
				legend
			/>
		</Box>
	)
}
