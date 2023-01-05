import { getPercentageDisplayValue } from '@components/ProgressBarTable/utils/utils'
import { useGetErrorGroupTagsQuery } from '@graph/hooks'
import { GetErrorGroupQuery } from '@graph/operations'
import {
	ErrorGroupTagAggregation,
	ErrorGroupTagAggregationBucket,
} from '@graph/schemas'
import { Box, Stack, Tag, Text } from '@highlight-run/ui'
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

	const { data } = useGetErrorGroupTagsQuery({
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
		// Only invoke on new data.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.errorGroupTags])

	return (
		<Stack direction="row" justify="space-between">
			<Distribution title="Environments" aggregation={environments} />
			<Distribution title="Browsers" aggregation={browsers} />
			<Distribution
				title="Operating Systems"
				noBorder
				aggregation={operatingSystems}
			/>
		</Stack>
	)
}

const Distribution: React.FC<
	React.PropsWithChildren<{
		title: string
		aggregation?: ErrorGroupTagAggregation
		noBorder?: boolean
	}>
> = ({ title, aggregation, noBorder = false }) => (
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
			justifyContent="space-between"
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

			{aggregation?.buckets && <Buckets buckets={aggregation.buckets} />}
		</Box>
	</Box>
)

const Buckets: React.FC<
	React.PropsWithChildren<{
		buckets: ErrorGroupTagAggregationBucket[]
	}>
> = ({ buckets }) => {
	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="12"
			justifyContent="space-between"
			style={{ height: '100%' }}
		>
			{buckets.map((bucket) => {
				return (
					<Box key={bucket.key}>
						<Text>{bucket.key}</Text>
						<Stack direction="row" align="center">
							<Progress
								percent={bucket.percent * 100}
								strokeColor={colors.n8}
								showInfo={false}
							/>
							<Tag kind="secondary">
								{getPercentageDisplayValue(bucket.percent)}
							</Tag>
							<Text>{bucket.doc_count}</Text>
						</Stack>
					</Box>
				)
			})}
		</Box>
	)
}

export { ErrorDistributions }
