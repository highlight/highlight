import { Button } from '@components/Button'
import { TIME_FORMAT } from '@components/Search/SearchForm/constants'
import { SearchForm } from '@components/Search/SearchForm/SearchForm'
import {
	useEditProjectSettingsMutation,
	useGetLogsKeysQuery,
	useGetLogsKeyValuesLazyQuery,
	useGetProjectSettingsQuery,
	useGetTracesKeysQuery,
	useGetTracesKeyValuesLazyQuery,
	useGetTracesMetricsQuery,
	useGetWorkspaceSettingsQuery,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { ProductType, Sampling, TracesMetricType } from '@graph/schemas'
import {
	Badge,
	Box,
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
	useFormStore,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import ErrorQueryBuilder from '@pages/ErrorsV2/ErrorQueryBuilder/ErrorQueryBuilder'
import LogsHistogram from '@pages/LogsPage/LogsHistogram/LogsHistogram'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import SessionQueryBuilder from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/SessionQueryBuilder'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { buildQueryStateString } from '@util/url/params'
import { showIntercomMessage } from '@util/window'
import { message } from 'antd'
import _, { upperFirst } from 'lodash'
import moment from 'moment'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export const Header: React.FC<{
	product: ProductType
	title: string
	subtitle?: string
}> = ({ title, subtitle, product }) => {
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
			<Heading mt="16">{title}</Heading>
			<Box my="24">
				<Text>{subtitle}</Text>
			</Box>
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
	const { searchQuery, setSearchQuery } = useSearchContext()
	const {
		searchQuery: errorSearchQuery,
		setSearchQuery: setErrorSearchQuery,
	} = useErrorSearchContext()
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
	const [editProjectSettingsMutation, { loading: saveLoading }] =
		useEditProjectSettingsMutation({
			refetchQueries: [namedOperations.Query.GetProjectSettings],
		})

	const formStore = useFormStore({
		defaultValues: {
			exclusionQuery: '',
			samplingPercent: 100,
			minuteRateLimit: 1_000_000,
		},
	})

	const canSaveIngestFilters = React.useCallback(async () => {
		if (!workspaceSettingsData?.workspaceSettings?.enable_ingest_filters) {
			analytics.track('Project Filters Upgrade', {
				product,
				workspaceId: currentWorkspace?.id,
			})
			await message.warn(
				'Setting up ingest filters is only available on annual commitment plans.',
			)
			showIntercomMessage(
				'Hi! I would like to use the ingest filter feature.',
			)
			return false
		}
		return true
	}, [
		currentWorkspace?.id,
		product,
		workspaceSettingsData?.workspaceSettings?.enable_ingest_filters,
	])

	const resetConfig = React.useCallback(() => {
		// TODO(vkorolik) exclusion query logic is not robust to operators and frontend types
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
			exclusionQuery: c?.exclusion_query ?? '',
			samplingPercent: 100 * (c?.sampling_rate ?? 1),
			minuteRateLimit: c?.minute_rate_limit ?? 1_000_000,
		})

		if (
			c?.exclusion_query &&
			(product === ProductType.Sessions || product === ProductType.Errors)
		) {
			const params = {} as { [key: string]: string }
			for (const pair of (c?.exclusion_query ?? '').split(' ')) {
				const [key, value] = pair.split(':')
				params[
					`${product.toLowerCase().slice(0, -1)}_${key}`
				] = `is:${value}`
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
		if (!(await canSaveIngestFilters())) {
			return
		}

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
	}
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
									initialQuery={formStore.getValue(
										'exclusionQuery',
									)}
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
								<SessionQueryBuilder
									minimal
									readonly={view}
									setDefault={false}
								/>
							) : (
								<ErrorQueryBuilder
									minimal
									readonly={view}
									setDefault={false}
								/>
							)}
						</Box>
						{view ? (
							<Button
								trackingId={`project-filters-${product}-edit`}
								kind="secondary"
								size="small"
								emphasis="medium"
								iconRight={<IconSolidPencil />}
								onClick={async () => {
									if (!(await canSaveIngestFilters())) {
										return
									}
									navigate(product.toLowerCase())
								}}
							>
								Edit
							</Button>
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
								{formStore
									.getValue('minuteRateLimit')
									.toLocaleString()}{' '}
								/ minute
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
						presets={defaultPresets}
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
							<Box display="flex" width="full" gap="8">
								<Box
									width="full"
									display="flex"
									flexDirection="column"
									gap="4"
								>
									<Form.Label
										label="Sampling %"
										name={formStore.names.samplingPercent}
									/>
									<Form.Input
										name={formStore.names.samplingPercent}
										type="number"
									/>
								</Box>
								<Box
									width="full"
									display="flex"
									flexDirection="column"
									gap="4"
								>
									<Form.Label
										label="Max ingest per minute"
										name={formStore.names.minuteRateLimit}
									/>
									<Form.Input
										name={formStore.names.minuteRateLimit}
										type="number"
									/>
								</Box>
							</Box>
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
			metric_types: [TracesMetricType.Count],
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
			{
				level: 'Dropped',
				count:
					(100 *
						(groupedByBucket[b.bucket_id][1]?.metric_value ?? 0)) /
					((groupedByBucket[b.bucket_id][0]?.metric_value ?? 0) +
						(groupedByBucket[b.bucket_id][1]?.metric_value ?? 0)),
				unit: '%',
			},
		],
	}))

	return (
		<Box width="full" height="full">
			<LogsHistogram
				startDate={dateRange.start}
				endDate={dateRange.end}
				onDatesChange={() => {}}
				histogramBuckets={histogramBuckets}
				bucketCount={data?.traces_metrics.bucket_count}
				loading={loading}
				legend
			/>
		</Box>
	)
}
