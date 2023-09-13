import { Box, Callout, Stack, Table, Text } from '@highlight-run/ui'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import LoadingBox from '@/components/LoadingBox'
import { GetTracesQuery } from '@/graph/generated/operations'
import { useProjectId } from '@/hooks/useProjectId'

type Props = {
	loading: boolean
	traces?: GetTracesQuery['traces']
}

export const TracesList: React.FC<Props> = ({ loading, traces }) => {
	const { projectId } = useProjectId()
	const navigate = useNavigate()

	return (
		<>
			{loading ? (
				<LoadingBox />
			) : traces ? (
				<Table height="full" noBorder>
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
									<Table.Cell>
										{trace.statusMessage}
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
