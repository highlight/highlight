import { CircularSpinner } from '@components/Loading/Loading'
import { getPercentageDisplayValue } from '@components/ProgressBarTable/utils/utils'
import { useGetErrorGroupTagsQuery } from '@graph/hooks'
import { GetErrorGroupQuery } from '@graph/operations'
import {
	ErrorGroupTagAggregation,
	ErrorGroupTagAggregationBucket,
} from '@graph/schemas'
import { Badge, Box, Stack, Text } from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import { Progress } from 'antd'
import React, { useEffect, useState } from 'react'
import { useLocalStorage } from 'react-use'

type Props = {
	errorGroup: GetErrorGroupQuery['error_group']
}

const ErrorDistributions = ({ errorGroup }: Props) => {
	const [environments, setEnvironments] = useState<
		ErrorGroupTagAggregation | undefined
	>()
	const [browsers, setBrowsers] = useState<
		ErrorGroupTagAggregation | undefined
	>()
	const [operatingSystems, setOperatingSystems] = useState<
		ErrorGroupTagAggregation | undefined
	>()
	const [useClickhouse] = useLocalStorage(
		'highlight-clickhouse-errors',
		false,
	)
	const { loading, data } = useGetErrorGroupTagsQuery({
		variables: {
			error_group_secure_id: `${errorGroup?.secure_id}`,
			use_clickhouse: useClickhouse,
		},
		skip: !errorGroup?.secure_id,
	})

	useEffect(() => {
		const foundEnvironmentTag = data?.errorGroupTags.find((tag) => {
			return tag.key === 'environment'
		})

		if (foundEnvironmentTag) {
			setEnvironments(foundEnvironmentTag)
		}

		const foundBrowserTag = data?.errorGroupTags.find((tag) => {
			return tag.key === 'browser'
		})

		if (foundBrowserTag) {
			setBrowsers(foundBrowserTag)
		}

		const foundOperatingSytemTag = data?.errorGroupTags.find((tag) => {
			return tag.key === 'os_name'
		})

		if (foundOperatingSytemTag) {
			setOperatingSystems(foundOperatingSytemTag)
		}
	}, [data?.errorGroupTags])

	return (
		<Stack direction="row" justify="space-between">
			<Distribution
				title="Environments"
				aggregation={environments}
				loading={loading}
			/>
			<Distribution
				title="Browsers"
				aggregation={browsers}
				loading={loading}
			/>
			<Distribution
				title="Operating Systems"
				noBorder
				aggregation={operatingSystems}
				loading={loading}
			/>
		</Stack>
	)
}

const Distribution: React.FC<
	React.PropsWithChildren<{
		title: string
		aggregation?: ErrorGroupTagAggregation
		loading: boolean
		noBorder?: boolean
	}>
> = ({ title, aggregation, loading, noBorder = false }) => {
	const hasBuckets = !loading && aggregation?.buckets
	return (
		<Box
			borderRight={noBorder ? undefined : 'secondary'}
			py="16"
			pr="16"
			flex="stretch"
		>
			<Box
				display="flex"
				flexDirection="column"
				gap="12"
				style={{ height: '100%' }}
			>
				<Box
					display="flex"
					justifyContent="space-between"
					flexDirection="row"
					alignItems="center"
				>
					<Text weight="bold">{title}</Text>
				</Box>

				{!hasBuckets ? (
					<CircularSpinner />
				) : (
					<Buckets buckets={aggregation.buckets} />
				)}
			</Box>
		</Box>
	)
}

const Buckets: React.FC<
	React.PropsWithChildren<{
		buckets: ErrorGroupTagAggregationBucket[]
	}>
> = ({ buckets }) => {
	return (
		<Box display="flex" flexDirection="column" gap="8">
			{buckets.map((bucket) => {
				return (
					<Box key={bucket.key}>
						<Box
							display="flex"
							justifyContent="space-between"
							alignItems="center"
						>
							<Text>{bucket.key}</Text>
							<Box display="flex" gap="4" alignItems="center">
								<Badge
									variant="gray"
									size="small"
									label={getPercentageDisplayValue(
										bucket.percent,
									)}
								/>
								<Text weight="bold" as="span">
									{bucket.doc_count}
								</Text>
							</Box>
						</Box>
						<Progress
							percent={Math.floor(bucket.percent * 100)}
							showInfo={false}
							strokeColor={colors.n8}
							trailColor={colors.n4}
							strokeWidth={4}
							status="normal"
						/>
					</Box>
				)
			})}
		</Box>
	)
}

export { ErrorDistributions }
