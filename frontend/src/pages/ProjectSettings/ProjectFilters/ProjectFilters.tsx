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
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { ProductType, TracesMetricType } from '@graph/schemas'
import {
	Badge,
	Box,
	defaultPresets,
	getNow,
	Heading,
	IconSolidCheveronRight,
	IconSolidPencil,
	PreviousDateRangePicker,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import ErrorQueryBuilder from '@pages/ErrorsV2/ErrorQueryBuilder/ErrorQueryBuilder'
import LogsHistogram from '@pages/LogsPage/LogsHistogram/LogsHistogram'
import SessionQueryBuilder from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/SessionQueryBuilder'
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
			<ProjectProductFilters product={ProductType.Sessions} noHeader />
			<Box my="20" borderBottom="dividerWeak" />
			<ProjectProductFilters product={ProductType.Errors} noHeader />
			<Box my="20" borderBottom="dividerWeak" />
			<ProjectProductFilters product={ProductType.Logs} noHeader />
			<Box my="20" borderBottom="dividerWeak" />
			<ProjectProductFilters product={ProductType.Traces} noHeader />
		</Stack>
	)
}

interface Config {
	exclusion_query: string
	sampling_rate: number
	minute_rate_limit: number
}

interface DateRange {
	start: Date
	end: Date
}

export const ProjectProductFilters: React.FC<{
	product: ProductType
	noHeader?: boolean
}> = ({ product, noHeader }) => {
	const { projectId } = useProjectId()
	const [dateRange, setDateRange] = React.useState<DateRange>({
		start: defaultPresets[3].startDate,
		end: getNow().toDate(),
	})
	const { data } = useGetProjectSettingsQuery({
		variables: {
			projectId: projectId!,
		},
		skip: !projectId,
	})
	const [editProjectSettingsMutation] = useEditProjectSettingsMutation({
		refetchQueries: [namedOperations.Query.GetProjectSettings],
	})
	const [config, setConfig] = React.useState<Config>()

	const resetConfig = React.useCallback(() => {
		const c =
			product === ProductType.Sessions
				? {
						exclusion_query:
							data?.projectSettings?.sampling
								.session_exclusion_query,
						sampling_rate:
							data?.projectSettings?.sampling
								.session_sampling_rate,
						minute_rate_limit:
							data?.projectSettings?.sampling
								.session_minute_rate_limit,
				  }
				: product === ProductType.Errors
				? {
						exclusion_query:
							data?.projectSettings?.sampling
								.error_exclusion_query,
						sampling_rate:
							data?.projectSettings?.sampling.error_sampling_rate,
						minute_rate_limit:
							data?.projectSettings?.sampling
								.error_minute_rate_limit,
				  }
				: product === ProductType.Logs
				? {
						exclusion_query:
							data?.projectSettings?.sampling.log_exclusion_query,
						sampling_rate:
							data?.projectSettings?.sampling.log_sampling_rate,
						minute_rate_limit:
							data?.projectSettings?.sampling
								.log_minute_rate_limit,
				  }
				: product === ProductType.Traces
				? {
						exclusion_query:
							data?.projectSettings?.sampling
								.trace_exclusion_query,
						sampling_rate:
							data?.projectSettings?.sampling.trace_sampling_rate,
						minute_rate_limit:
							data?.projectSettings?.sampling
								.trace_minute_rate_limit,
				  }
				: undefined
		setConfig({
			exclusion_query: c?.exclusion_query ?? '',
			sampling_rate: c?.sampling_rate ?? 1,
			minute_rate_limit: c?.minute_rate_limit ?? 1_000_000,
		})
	}, [data?.projectSettings?.sampling, product])

	React.useEffect(resetConfig, [resetConfig])

	if (!product || !config) {
		return null
	}

	return (
		<ProjectProductFiltersPicker
			product={product}
			config={config}
			dateRange={dateRange}
			onDateRangeChange={setDateRange}
			noHeader={noHeader}
			onChange={(c: Partial<Config>) => {
				setConfig((cfg) =>
					cfg
						? {
								exclusion_query:
									c?.exclusion_query ?? cfg?.exclusion_query,
								sampling_rate:
									c?.sampling_rate ?? cfg?.sampling_rate,
								minute_rate_limit:
									c?.minute_rate_limit ??
									cfg?.minute_rate_limit,
						  }
						: undefined,
				)
			}}
			onReset={resetConfig}
			onSave={async () => {
				const sampling =
					product === ProductType.Sessions
						? {
								session_exclusion_query: config.exclusion_query,
								session_sampling_rate: config.sampling_rate,
								session_minute_rate_limit:
									config.minute_rate_limit,
						  }
						: product === ProductType.Errors
						? {
								error_exclusion_query: config.exclusion_query,
								error_sampling_rate: config.sampling_rate,
								error_minute_rate_limit:
									config.minute_rate_limit,
						  }
						: product === ProductType.Logs
						? {
								log_exclusion_query: config.exclusion_query,
								log_sampling_rate: config.sampling_rate,
								log_minute_rate_limit: config.minute_rate_limit,
						  }
						: product === ProductType.Traces
						? {
								trace_exclusion_query: config.exclusion_query,
								trace_sampling_rate: config.sampling_rate,
								trace_minute_rate_limit:
									config.minute_rate_limit,
						  }
						: {}
				await editProjectSettingsMutation({
					variables: {
						projectId,
						sampling,
					},
				})
			}}
		/>
	)
}

const ProjectProductFiltersPicker: React.FC<{
	product: ProductType
	config: Config
	dateRange: DateRange
	onDateRangeChange: (range: DateRange) => void
	onChange: (config: Partial<Config>) => void
	onReset: () => void
	onSave: () => void
	noHeader?: boolean
}> = ({
	product,
	config,
	dateRange,
	onDateRangeChange,
	onChange,
	onReset,
	onSave,
	noHeader,
}) => {
	const navigate = useNavigate()
	const label = upperFirst(product.slice(0, -1))
	return (
		<Box width="full">
			{noHeader ? null : (
				<Header product={product} title={`${label} filters`} />
			)}
			<Box display="flex" flexDirection="column" gap="12">
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
					width="full"
				>
					<Text>{label} filters</Text>
					{noHeader ? null : (
						<Box display="flex" alignItems="center" gap="6">
							<Button
								trackingId={`project-filters-${product}-discard`}
								kind="secondary"
								size="small"
								emphasis="low"
								onClick={onReset}
							>
								Discard changes
							</Button>
							<Button
								trackingId={`project-filters-${product}-save`}
								kind="primary"
								size="small"
								emphasis="high"
								onClick={onSave}
							>
								Save changes
							</Button>
						</Box>
					)}
				</Box>
				<Box display="flex" width="full" py="12" gap="6">
					<Box width="full">
						{product === ProductType.Sessions ? (
							<SessionQueryBuilder
								minimal /*TODO(vkorolik) use exclusion query, on update*/
							/>
						) : product === ProductType.Errors ? (
							<ErrorQueryBuilder
								minimal /*TODO(vkorolik) use exclusion query, on update*/
							/>
						) : product === ProductType.Logs ||
						  product === ProductType.Traces ? (
							<SearchForm
								initialQuery={config.exclusion_query}
								onFormSubmit={(value) =>
									onChange({ exclusion_query: value })
								}
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
						) : null}
					</Box>
					{noHeader ? (
						<Button
							trackingId={`project-filters-${product}-edit`}
							kind="secondary"
							size="small"
							emphasis="medium"
							iconRight={<IconSolidPencil />}
							onClick={() => {
								navigate(product)
							}}
						>
							Edit
						</Button>
					) : null}
				</Box>
				<Box
					display="flex"
					justifyContent="space-between"
					width="full"
					py="12"
				>
					<Text>
						{label} sampling: {100 * config.sampling_rate}%
					</Text>
					{/*TODO(vkorolik) make inputs onChange*/}
					<Text>
						Max ingested {product}: {config.minute_rate_limit} /
						minute
					</Text>
				</Box>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					width="full"
					py="12"
				>
					<Text weight="medium" size="xSmall" color="weak">
						{label}s
					</Text>
					<PreviousDateRangePicker
						selectedDates={[dateRange.start, dateRange.end]}
						onDatesChange={(dates) =>
							onDateRangeChange({
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
				<Box display="flex" width="full" py="12">
					<IngestTimeline product={product} dateRange={dateRange} />
				</Box>
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
				count: groupedByBucket[b.bucket_id][0]?.metric_value ?? 0,
			},
			{
				level: 'Dropped',
				count: groupedByBucket[b.bucket_id][1]?.metric_value ?? 0,
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
			/>
		</Box>
	)
}
