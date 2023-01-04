import { useGetErrorGroupTagsQuery } from '@graph/hooks'
import { GetErrorGroupQuery } from '@graph/operations'
import { ErrorGroupTagAggregation } from '@graph/schemas'
import { Box, Stack, Text } from '@highlight-run/ui'
import React, { useEffect, useState } from 'react'

type Props = {
	errorGroup: GetErrorGroupQuery['error_group']
}

const ErrorDistributions = ({ errorGroup }: Props) => {
	const [environments, setEnvironments] = useState<
		ErrorGroupTagAggregation | undefined
	>()

	const { data, loading } = useGetErrorGroupTagsQuery({
		variables: {
			project_id: `${errorGroup?.project_id}`,
			error_group_secure_id: `${errorGroup?.secure_id}`,
		},
		skip: !errorGroup?.secure_id,
	})

	const buildEnvironments = () => {
		const environment = data?.errorGroupTags.find((tag) => {
			return tag.key === 'environment'
		})

		if (environment) {
			setEnvironments(environment)
		}
	}

	useEffect(() => {
		buildEnvironments()
		// Only invoke on new data.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.errorGroupTags])

	return (
		<Stack direction="row" align="center" justify="space-between">
			<Distribution title="Environments" aggregation={environments} />
			<Distribution title="Browsers" aggregation={environments} />
			<Distribution
				title="Operating Systems"
				noBorder
				aggregation={environments}
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
> = ({ title, children, aggregation, noBorder = false }) => (
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
				<Box
					display="flex"
					justifyContent="space-between"
					flexDirection="row"
					alignItems="center"
				>
					<Text weight="bold">{title}</Text>
				</Box>
				{aggregation?.totalCount && <Box>{aggregation.totalCount}</Box>}
			</Box>

			<Box display="flex" alignItems="center" style={{ height: 24 }}>
				{children}
			</Box>
		</Box>
	</Box>
)

export { ErrorDistributions }
