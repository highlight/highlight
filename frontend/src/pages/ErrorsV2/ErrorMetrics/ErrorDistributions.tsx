import { CircularSpinner } from '@components/Loading/Loading'
import { useGetErrorGroupTagsQuery } from '@graph/hooks'
import { GetErrorGroupQuery } from '@graph/operations'
import {
	ErrorGroupTagAggregation,
	ErrorGroupTagAggregationBucket,
} from '@graph/schemas'
import { Box, Stack, Text } from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import { Progress } from 'antd'
import React, { useEffect, useState } from 'react'

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

	const { loading, data } = useGetErrorGroupTagsQuery({
		variables: {
			error_group_secure_id: `${errorGroup?.secure_id}`,
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
		<Box display="flex" flexDirection="column" gap="12">
			{buckets.map((bucket) => {
				return (
					<Box key={bucket.key}>
						<Text>{bucket.key}</Text>
						<Progress
							percent={Math.floor(bucket.percent * 100)}
							strokeColor={colors.n8}
							status="normal"
						/>
					</Box>
				)
			})}
		</Box>
	)
}

export { ErrorDistributions }
