import {
	Badge,
	Box,
	IconSolidAcademicCap,
	IconSolidMenuAlt_2,
	IconSolidPlayCircle,
	Stack,
	Table,
	Tag,
	Text,
} from '@highlight-run/ui'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { AdditionalFeedResults } from '@/components/FeedResults/FeedResults'
import { LinkButton } from '@/components/LinkButton'
import LoadingBox from '@/components/LoadingBox'
import { GetTracesQuery } from '@/graph/generated/operations'
import { Trace } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { useParams } from '@/util/react-router/useParams'

type Props = {
	loading: boolean
	numMoreTraces?: number
	traces?: GetTracesQuery['traces']
	handleAdditionalTracesDateChange?: () => void
	resetMoreTraces?: () => void
}

const gridColumns = ['2fr', '1fr', '2fr', '1fr', '2fr', '1.2fr']

export const TracesList: React.FC<Props> = ({
	loading,
	numMoreTraces,
	traces,
	handleAdditionalTracesDateChange,
	resetMoreTraces,
}) => {
	const { projectId } = useProjectId()
	const { span_id } = useParams<{ span_id?: string }>()
	const navigate = useNavigate()
	const location = useLocation()

	const viewTrace = (trace: Partial<Trace>) => {
		navigate(
			`/${projectId}/traces/${trace.traceID}/${trace.spanID}${location.search}`,
		)
	}

	return (
		<>
			{loading ? (
				<LoadingBox />
			) : traces && traces.edges.length > 0 ? (
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
						{numMoreTraces !== undefined && numMoreTraces > 0 && (
							<Table.Row>
								<Box width="full">
									<AdditionalFeedResults
										more={numMoreTraces}
										type="traces"
										onClick={() => {
											resetMoreTraces && resetMoreTraces()
											handleAdditionalTracesDateChange &&
												handleAdditionalTracesDateChange()
										}}
									/>
								</Box>
							</Table.Row>
						)}
					</Table.Head>
					<Table.Body
						height="full"
						overflowY="auto"
						style={{
							// Subtract height of search filters + table header + charts
							height:
								numMoreTraces && numMoreTraces > 0
									? `calc(100% - 191px)`
									: `calc(100% - 163px)`,
						}}
					>
						{traces.edges
							.map((edge) => edge.node)
							.map((trace, index) => {
								const isSelected = trace.spanID === span_id

								return (
									<Table.Row
										key={index}
										gridColumns={gridColumns}
										selected={isSelected}
									>
										<Table.Cell
											onClick={() => viewTrace(trace)}
										>
											<Box
												display="flex"
												alignItems="center"
												justifyContent="space-between"
												width="full"
											>
												<Stack
													direction="row"
													align="center"
												>
													<Badge
														variant="outlineGray"
														shape="basic"
														size="medium"
														iconStart={
															<IconSolidMenuAlt_2 size="12" />
														}
													/>
													<Text
														lines="1"
														color="strong"
													>
														{trace.spanName}
													</Text>
												</Stack>
												<Table.Discoverable>
													<Badge
														variant="outlineGray"
														label="Open"
														size="medium"
													/>
												</Table.Discoverable>
											</Box>
										</Table.Cell>
										<Table.Cell>
											<Text
												lines="1"
												title={trace.serviceName}
											>
												{trace.serviceName}
											</Text>
										</Table.Cell>
										<Table.Cell>{trace.traceID}</Table.Cell>
										<Table.Cell>
											{trace.parentSpanID ? (
												<Text lines="1">
													{trace.parentSpanID}
												</Text>
											) : (
												<Text color="secondaryContentOnDisabled">
													empty
												</Text>
											)}
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
											{trace.secureSessionID ? (
												<Tag
													kind="secondary"
													shape="basic"
													iconLeft={
														<IconSolidPlayCircle />
													}
												>
													{trace.secureSessionID}
												</Tag>
											) : (
												<Text color="secondaryContentOnDisabled">
													empty
												</Text>
											)}
										</Table.Cell>
										<Table.Cell>
											<Text lines="1">
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
											</Text>
										</Table.Cell>
									</Table.Row>
								)
							})}
					</Table.Body>
				</Table>
			) : (
				<Box px="12" py="8">
					<Box
						border="secondary"
						borderRadius="6"
						display="flex"
						flexDirection="row"
						gap="6"
						p="8"
						alignItems="center"
						width="full"
					>
						<Box alignSelf="flex-start">
							<Badge
								size="medium"
								shape="basic"
								variant="gray"
								iconStart={<IconSolidAcademicCap size="12" />}
							/>
						</Box>
						<Stack
							gap="12"
							flexGrow={1}
							style={{ padding: '5px 0' }}
						>
							<Text color="strong" weight="bold" size="small">
								Set up traces
							</Text>
							<Text color="moderate">
								No traces found. Have you finished setting up
								tracing in your app yet?
							</Text>
						</Stack>

						<Box alignSelf="center" display="flex">
							<LinkButton
								to="https://www.highlight.io/docs/getting-started/tracing/overview"
								kind="primary"
								size="small"
								trackingId="tracing-empty-state_learn-more-setup"
								target="_blank"
							>
								Learn more
							</LinkButton>
						</Box>
					</Box>
				</Box>
			)}
		</>
	)
}
