import { Box, Callout, Stack, Table, Text } from '@highlight-run/ui'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import LoadingBox from '@/components/LoadingBox'
import { GetTracesQuery } from '@/graph/generated/operations'
import { Trace } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'

type Props = {
	loading: boolean
	traces?: GetTracesQuery['traces']
}

const gridColumns = ['1fr', '70px', '1fr', '1fr', '1fr', '1fr']

export const TracesList: React.FC<Props> = ({ loading, traces }) => {
	const { projectId } = useProjectId()
	const navigate = useNavigate()

	const viewTrace = (trace: Trace) => {
		navigate(`/${projectId}/traces/${trace.traceID}`)
	}

	return (
		<>
			{loading ? (
				<LoadingBox />
			) : traces ? (
				<Table height="full" noBorder>
					<Table.Head>
						<Table.Row gridColumns={gridColumns}>
							<Table.Header>Span</Table.Header>
							<Table.Header>Service</Table.Header>
							<Table.Header>Trace ID</Table.Header>
							<Table.Header>Parent Span ID</Table.Header>
							<Table.Header>Secure Session ID</Table.Header>
							<Table.Header>Timestamp</Table.Header>
						</Table.Row>
					</Table.Head>
					<Table.Body
						height="full"
						overflowY="auto"
						style={{
							// Subtract height of search filters + table header
							height: `calc(100% - 67px)`,
						}}
					>
						{traces.edges
							.map((edge) => edge.node)
							.map((trace, index) => (
								<Table.Row
									key={index}
									gridColumns={gridColumns}
								>
									<Table.Cell
										onClick={() => viewTrace(trace)}
									>
										{trace.spanName}
									</Table.Cell>
									<Table.Cell>{trace.serviceName}</Table.Cell>
									<Table.Cell
										onClick={() => viewTrace(trace)}
									>
										{trace.traceID}
									</Table.Cell>
									<Table.Cell>
										{trace.parentSpanID}
									</Table.Cell>
									<Table.Cell
										onClick={
											trace.secureSessionID
												? () => {
														navigate(
															`/${projectId}/sessions/${trace.secureSessionID}`,
														)
												  }
												: undefined
										}
									>
										{trace.secureSessionID}
									</Table.Cell>
									<Table.Cell>
										{new Date(
											trace.timestamp,
										).toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric',
											year: 'numeric',
											hour: 'numeric',
											minute: 'numeric',
											second: 'numeric',
										})}
									</Table.Cell>
								</Table.Row>
							))}
					</Table.Body>
				</Table>
			) : (
				<Stack
					align="center"
					direction="column"
					justify="space-around"
					height="full"
				>
					<Callout title="No traces found" width={300}>
						<Box pb="4">
							<Text color="moderate">
								TODO: Write a CTA here...
							</Text>
						</Box>
					</Callout>
				</Stack>
			)}
		</>
	)
}
