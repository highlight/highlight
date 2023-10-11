import { Button } from '@components/Button'
import { SearchForm } from '@components/Search/SearchForm/SearchForm'
import {
	useEditProjectSettingsMutation,
	useGetLogsKeysQuery,
	useGetLogsKeyValuesLazyQuery,
	useGetProjectSettingsQuery,
	useGetTracesKeysQuery,
	useGetTracesKeyValuesLazyQuery,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
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
import ErrorFeedHistogram from '@pages/ErrorsV2/ErrorFeedHistogram/ErrorFeedHistogram'
import ErrorQueryBuilder from '@pages/ErrorsV2/ErrorQueryBuilder/ErrorQueryBuilder'
import SessionQueryBuilder from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/SessionQueryBuilder'
import { SessionsHistogram } from '@pages/Sessions/SessionsFeedV3/SessionsFeedV3'
import { upperFirst } from 'lodash'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export type Product = 'sessions' | 'errors' | 'logs' | 'traces'

export const Header: React.FC<{
	product: Product
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
			<ProjectProductFilters product="sessions" noHeader />
			<Box my="20" borderBottom="dividerWeak" />
			<ProjectProductFilters product="errors" noHeader />
			<Box my="20" borderBottom="dividerWeak" />
			<ProjectProductFilters product="logs" noHeader />
			<Box my="20" borderBottom="dividerWeak" />
			<ProjectProductFilters product="traces" noHeader />
		</Stack>
	)
}

interface Config {
	exclusion_query: string
	sampling_rate: number
	minute_rate_limit: number
}

export const ProjectProductFilters: React.FC<{
	product: Product
	noHeader?: boolean
}> = ({ product, noHeader }) => {
	const { projectId } = useProjectId()
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
			product === 'sessions'
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
				: product === 'errors'
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
				: product === 'logs'
				? {
						exclusion_query:
							data?.projectSettings?.sampling.log_exclusion_query,
						sampling_rate:
							data?.projectSettings?.sampling.log_sampling_rate,
						minute_rate_limit:
							data?.projectSettings?.sampling
								.log_minute_rate_limit,
				  }
				: product === 'traces'
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
					product === 'sessions'
						? {
								session_exclusion_query: config.exclusion_query,
								session_sampling_rate: config.sampling_rate,
								session_minute_rate_limit:
									config.minute_rate_limit,
						  }
						: product === 'errors'
						? {
								error_exclusion_query: config.exclusion_query,
								error_sampling_rate: config.sampling_rate,
								error_minute_rate_limit:
									config.minute_rate_limit,
						  }
						: product === 'logs'
						? {
								log_exclusion_query: config.exclusion_query,
								log_sampling_rate: config.sampling_rate,
								log_minute_rate_limit: config.minute_rate_limit,
						  }
						: product === 'traces'
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
	product: Product
	config: Config
	onChange: (config: Partial<Config>) => void
	onReset: () => void
	onSave: () => void
	noHeader?: boolean
}> = ({ product, config, onChange, onReset, onSave, noHeader }) => {
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
						{product === 'sessions' ? (
							<SessionQueryBuilder
								minimal /*TODO(vkorolik) use exclusion query, on update*/
							/>
						) : product === 'errors' ? (
							<ErrorQueryBuilder
								minimal /*TODO(vkorolik) use exclusion query, on update*/
							/>
						) : product === 'logs' || product === 'traces' ? (
							<SearchForm
								initialQuery={config.exclusion_query}
								onFormSubmit={(value) =>
									onChange({ exclusion_query: value })
								}
								startDate={defaultPresets[5].startDate}
								endDate={getNow().toDate()}
								onDatesChange={() => {}}
								presets={defaultPresets}
								minDate={defaultPresets[5].startDate}
								timeMode="fixed-range"
								fetchKeys={
									product === 'logs'
										? useGetLogsKeysQuery
										: useGetTracesKeysQuery
								}
								fetchValuesLazyQuery={
									product === 'logs'
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
						selectedDates={[defaultPresets[5].startDate]}
						onDatesChange={() => {}}
						presets={defaultPresets}
						minDate={defaultPresets[5].startDate}
						kind="secondary"
						size="medium"
						emphasis="low"
						disabled={true}
					/>
				</Box>
				<Box display="flex" width="full" py="12">
					{product === 'sessions' ? (
						<SessionsHistogram readonly />
					) : product === 'errors' ? (
						<ErrorFeedHistogram readonly />
					) : /*TODO(vkorolik) use the IsIngestedBy counts, histogram for logs & traces */ null}
				</Box>
			</Box>
		</Box>
	)
}
