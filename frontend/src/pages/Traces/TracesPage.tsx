import { Box, Text } from '@highlight-run/ui'
import React from 'react'
import { Helmet } from 'react-helmet'

import { useGetTracesQuery } from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'

export const TracesPage: React.FC = () => {
	const { projectId } = useProjectId()

	const { data, loading } = useGetTracesQuery({
		variables: {
			project_id: projectId,
			params: {
				date_range: {
					start_date: '2021-08-01T00:00:00Z',
					end_date: '2023-08-31T23:59:59Z',
				},
				query: '',
			},
		},
	})

	return (
		<>
			<Helmet>
				<title>Traces</title>
			</Helmet>

			<Box
				background="n2"
				padding="8"
				flex="stretch"
				justifyContent="stretch"
				display="flex"
			>
				<Box
					background="white"
					borderRadius="6"
					flexDirection="column"
					display="flex"
					flexGrow={1}
					border="dividerWeak"
					shadow="medium"
				>
					{loading ? (
						<Text>Loading...</Text>
					) : (
						<>
							<Text>Traces</Text>
							<Text>{JSON.stringify(data)}</Text>
						</>
					)}
				</Box>
			</Box>
		</>
	)
}
