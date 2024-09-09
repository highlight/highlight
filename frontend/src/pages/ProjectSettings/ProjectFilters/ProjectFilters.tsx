import EnterpriseFeatureButton from '@components/Billing/EnterpriseFeatureButton'
import { Button } from '@components/Button'
import LoadingBox from '@components/LoadingBox'
import { TIME_FORMAT } from '@components/Search/SearchForm/constants'
import { SearchForm } from '@components/Search/SearchForm/SearchForm'
import {
	useEditProjectSettingsMutation,
	useGetBillingDetailsForProjectQuery,
	useGetMetricsQuery,
	useGetProjectSettingsQuery,
	useGetWorkspaceSettingsQuery,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import {
	AllWorkspaceSettings,
	MetricAggregator,
	MetricColumn,
	PlanType,
	ProductType,
	Sampling,
} from '@graph/schemas'
import {
	Badge,
	Box,
	Callout,
	DateRangePicker,
	DateRangePreset,
	DEFAULT_TIME_PRESETS,
	Form,
	Heading,
	IconSolidCheveronRight,
	IconSolidPencil,
	presetStartDate,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { useProjectId } from '@hooks/useProjectId'
import { BarChart } from '@pages/Graphing/components/BarChart'
import { TIMESTAMP_KEY } from '@pages/Graphing/components/Graph'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { groupBy, upperFirst } from 'lodash'
import moment from 'moment'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { SearchContext } from '@/components/Search/SearchContext'
import { DEMO_PROJECT_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton'

const DATE_RANGE_PRESETS = [DEFAULT_TIME_PRESETS[1], DEFAULT_TIME_PRESETS[3]]
const DEFAULT_PRESET = DATE_RANGE_PRESETS[0]

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
	const [selectedPreset, setSelectedPreset] =
		React.useState<DateRangePreset>(DEFAULT_PRESET)

	const [dateRange, setDateRange] = React.useState<DateRange>({
		start: presetStartDate(DEFAULT_PRESET),
		end: moment().toDate(),
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
		skip: !projectId || projectId === DEMO_PROJECT_ID,
	})
	const [editProjectSettingsMutation, { loading: saveLoading }] =
		useEditProjectSettingsMutation({
			refetchQueries: [namedOperations.Query.GetProjectSettings],
			awaitRefetchQueries: true,
		})

	const formStore = Form.useStore<{
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

	const query = formStore.useValue('exclusionQuery') ?? ''
	const canEditIngestion =
		workspaceSettingsData?.workspaceSettings?.enable_ingest_filtering
	const canEditSampling =
		workspaceSettingsData?.workspaceSettings?.enable_ingest_sampling

	// loads data from the backend into the form state and the query builder context
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
	}, [data?.projectSettings?.sampling, formStore, product])

	React.useEffect(resetConfig, [resetConfig])

	if (!product || loading) {
		return null
	}

	const label = upperFirst(product.slice(0, -1))
	const onSave = async () => {
		const sampling = {
			[`${product.toLowerCase().slice(0, -1)}_exclusion_query`]:
				formStore.getValue('exclusionQuery'),
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
		navigate(`/${projectId}/settings/filters`)
	}

	const edit = (
		<Button
			trackingId={`project-filters-${product}-edit`}
			kind="secondary"
			size="small"
			emphasis="medium"
			iconRight={<IconSolidPencil />}
			onClick={async () => {
				if (canEditIngestion) {
					navigate(product.toLowerCase())
				}
			}}
		>
			Edit
		</Button>
	)

	const save = (
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
				disabled={
					billingDetails?.billingDetailsForProject?.plan.type ===
					PlanType.Free
				}
			>
				Save changes
			</Button>
		</Box>
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
					<>
						<Text>{label} filters</Text>
						{view ? null : (
							<FilterPaywall
								setting="enable_ingest_filtering"
								product={product}
							>
								{save}
							</FilterPaywall>
						)}
					</>
				</Box>
				<Stack gap="6" py="6">
					<Box display="flex" width="full" gap="6">
						<Box width="full" style={{ minHeight: 20 }}>
							<SearchContext
								initialQuery={query}
								onSubmit={(value: string) => {
									formStore.setValue('exclusionQuery', value)
								}}
								disabled={view}
							>
								<SearchForm
									hideDatePicker
									hideCreateAlert
									startDate={dateRange.start}
									endDate={dateRange.end}
									onDatesChange={() => {}}
									presets={[]}
									minDate={moment()
										.subtract(30, 'days')
										.toDate()}
									timeMode="fixed-range"
									productType={product}
								/>
							</SearchContext>
						</Box>
						{view ? (
							<FilterPaywall
								setting="enable_ingest_filtering"
								product={product}
							>
								{edit}
							</FilterPaywall>
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
					<DateRangePicker
						selectedValue={{
							startDate: dateRange.start,
							endDate: dateRange.end,
							selectedPreset: selectedPreset,
						}}
						onDatesChange={(start, end, preset) => {
							setSelectedPreset(preset!)
							setDateRange({
								start: start,
								end: end,
							})
						}}
						presets={DATE_RANGE_PRESETS}
						noCustom
						minDate={moment().subtract(30, 'days').toDate()}
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
								<EnterpriseFeatureButton
									setting="enable_ingest_sampling"
									name="Ingestion Sampling"
									fn={async () => {}}
									variant="basic"
								>
									<Box display="flex" width="full" gap="8">
										<Box
											width="full"
											display="flex"
											flexDirection="column"
											gap="4"
										>
											<Form.Label
												label="Sampling %"
												name={
													formStore.names
														.samplingPercent
												}
											/>
											<Form.Input
												disabled={!canEditSampling}
												name={
													formStore.names
														.samplingPercent
												}
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
												name={
													formStore.names
														.minuteRateLimit
												}
											/>
											<Form.Input
												disabled={!canEditSampling}
												name={
													formStore.names
														.minuteRateLimit
												}
												type="number"
											/>
										</Box>
									</Box>
								</EnterpriseFeatureButton>
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

const FilterPaywall: React.FC<
	React.PropsWithChildren<{
		product: ProductType
		setting: keyof AllWorkspaceSettings
	}>
> = ({ setting, children }) => {
	return (
		<EnterpriseFeatureButton
			setting={setting}
			name="Ingestion Limits"
			fn={async () => undefined}
			variant="basic"
		>
			{children}
		</EnterpriseFeatureButton>
	)
}

const IngestTimeline: React.FC<{
	product: ProductType
	dateRange: DateRange
}> = ({ product, dateRange }) => {
	const { projectId } = useProjectId()
	const { data, loading } = useGetMetricsQuery({
		variables: {
			product_type: ProductType.Traces,
			project_id: projectId,
			column: MetricColumn.Duration,
			metric_types: [MetricAggregator.CountDistinctKey],
			group_by: ['ingested'],
			bucket_by: TIMESTAMP_KEY,
			params: {
				query: `span_name:IsIngestedBy product:${product}`,
				date_range: {
					start_date: moment(dateRange.start).format(TIME_FORMAT),
					end_date: moment(dateRange.end).format(TIME_FORMAT),
				},
			},
		},
	})

	const groupedByBucket = groupBy(
		data?.metrics.buckets.map((b) => ({
			...b,
			group: b.group[0] || 'true',
		})),
		(i) => i.bucket_id,
	)

	const histogramBuckets = data?.metrics.buckets.map((b) => ({
		[TIMESTAMP_KEY]: (b.bucket_min + b.bucket_max) / 2,
		['percent']:
			(100 *
				(groupedByBucket[b.bucket_id].find((g) => g.group === 'true')
					?.metric_value ?? 0)) /
			(groupedByBucket[b.bucket_id]
				.map((g) => g?.metric_value ?? 0)
				.reduce((a, b) => a + b, 0) || 1),
	}))

	if (loading) {
		return <LoadingBox />
	} else if (!data?.metrics.buckets?.length) {
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
		<Box width="full" style={{ height: 100 }}>
			<BarChart
				data={histogramBuckets}
				yAxisFunction={MetricAggregator.Count}
				xAxisMetric={TIMESTAMP_KEY}
				yAxisMetric="percent"
				series={['percent']}
				strokeColors={[vars.theme.static.content.moderate]}
				viewConfig={{
					type: 'Bar chart',
					showLegend: true,
				}}
			/>
		</Box>
	)
}
