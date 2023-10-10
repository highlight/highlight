import { Button } from '@components/Button'
import { SearchForm } from '@components/Search/SearchForm/SearchForm'
import {
	useGetLogsKeysQuery,
	useGetLogsKeyValuesLazyQuery,
	useGetProjectSettingsQuery,
} from '@graph/hooks'
import {
	Badge,
	Box,
	defaultPresets,
	getNow,
	Heading,
	IconSolidCheveronRight,
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

	if (!product) {
		return null
	}

	const query =
		(product === 'sessions'
			? data?.projectSettings?.sampling.session_exclusion_query
			: product === 'errors'
			? data?.projectSettings?.sampling.error_exclusion_query
			: product === 'logs'
			? data?.projectSettings?.sampling.log_exclusion_query
			: product === 'traces'
			? data?.projectSettings?.sampling.trace_exclusion_query
			: null) ?? ''
	const samplingPercent =
		((product === 'sessions'
			? data?.projectSettings?.sampling.session_sampling_rate
			: product === 'errors'
			? data?.projectSettings?.sampling.error_sampling_rate
			: product === 'logs'
			? data?.projectSettings?.sampling.log_sampling_rate
			: product === 'traces'
			? data?.projectSettings?.sampling.trace_sampling_rate
			: null) ?? 1) * 100
	const maxIngested =
		(product === 'sessions'
			? data?.projectSettings?.sampling.session_minute_rate_limit
			: product === 'errors'
			? data?.projectSettings?.sampling.error_minute_rate_limit
			: product === 'logs'
			? data?.projectSettings?.sampling.log_minute_rate_limit
			: product === 'traces'
			? data?.projectSettings?.sampling.trace_minute_rate_limit
			: null) ?? Infinity
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
					<Box display="flex" alignItems="center" gap="6">
						<Button
							trackingId="project-filters-discard"
							kind="secondary"
							size="small"
							emphasis="low"
							onClick={() => {
								/*TODO(vkorolik)*/
							}}
						>
							Discard changes
						</Button>
						<Button
							trackingId="project-filters-save"
							kind="primary"
							size="small"
							emphasis="high"
							onClick={() => {
								/*TODO(vkorolik)*/
							}}
						>
							Save changes
						</Button>
					</Box>
				</Box>
				<Box display="flex" width="full" py="12">
					{product === 'sessions' ? (
						<SessionQueryBuilder minimal />
					) : product === 'errors' ? (
						<ErrorQueryBuilder minimal />
					) : product === 'logs' ? (
						<SearchForm
							initialQuery={query}
							onFormSubmit={() => {
								/*TODO(vkorolik)*/
							}}
							startDate={defaultPresets[5].startDate}
							endDate={getNow().toDate()}
							onDatesChange={() => {
								/*TODO(vkorolik)*/
							}}
							presets={defaultPresets}
							minDate={defaultPresets[5].startDate}
							timeMode="fixed-range"
							fetchKeys={useGetLogsKeysQuery}
							fetchValuesLazyQuery={useGetLogsKeyValuesLazyQuery}
						/>
					) : product === 'traces' ? (
						<SearchForm
							initialQuery={query}
							onFormSubmit={() => {
								/*TODO(vkorolik)*/
							}}
							startDate={defaultPresets[5].startDate}
							endDate={getNow().toDate()}
							onDatesChange={() => {
								/*TODO(vkorolik)*/
							}}
							presets={defaultPresets}
							minDate={defaultPresets[5].startDate}
							timeMode="fixed-range"
							fetchKeys={useGetLogsKeysQuery}
							fetchValuesLazyQuery={useGetLogsKeyValuesLazyQuery}
						/>
					) : null}
				</Box>
				<Box
					display="flex"
					justifyContent="space-between"
					width="full"
					py="12"
				>
					<Text>
						{label} sampling: {samplingPercent}%
					</Text>
					<Text>
						Max ingested {product}: {maxIngested} per minute
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
					) : /*TODO(vkorolik) use the IsIngestedBy counts*/ null}
				</Box>
			</Box>
		</Box>
	)
}
