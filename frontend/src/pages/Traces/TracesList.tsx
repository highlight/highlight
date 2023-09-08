import { Box, Table, Text } from '@highlight-run/ui'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { GetTracesQuery } from '@/graph/generated/operations'
import { useProjectId } from '@/hooks/useProjectId'

type Props = {
	traces?: GetTracesQuery['traces']
	loading: boolean
}

export const TracesList: React.FC<Props> = ({ loading, traces }) => {
	const { projectId } = useProjectId()
	const navigate = useNavigate()

	return (
		<Box>
			{loading ? (
				<Text>Loading...</Text>
			) : traces ? (
				<Table noBorder>
					<Table.Head>
						<Table.Row>
							<Table.Header>Span</Table.Header>
							<Table.Header>Service</Table.Header>
							<Table.Header>Span ID</Table.Header>
							<Table.Header>Parent Span ID</Table.Header>
							<Table.Header>Secure Session ID</Table.Header>
							<Table.Header>Status</Table.Header>
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{traces.map((trace, index) => (
							<Table.Row key={index}>
								<Table.Cell>{trace.spanName}</Table.Cell>
								<Table.Cell>{trace.serviceName}</Table.Cell>
								<Table.Cell>{trace.spanID}</Table.Cell>
								<Table.Cell
									onClick={
										trace.parentSpanID
											? () => {
													navigate(
														`/${projectId}/traces?query=${window.encodeURIComponent(
															`ParentSpanId:${trace.parentSpanID}`,
														)}`,
													)
											  }
											: undefined
									}
								>
									{trace.parentSpanID}
								</Table.Cell>
								<Table.Cell
									onClick={() => {
										navigate(
											`/${projectId}/sessions/${trace.secureSessionID}`,
										)
									}}
								>
									{trace.secureSessionID}
								</Table.Cell>
								<Table.Cell>{trace.statusMessage}</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table>
			) : (
				<Box>No data</Box>
			)}
		</Box>
	)
}
