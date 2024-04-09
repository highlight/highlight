import { SearchEmptyState } from '@components/SearchEmptyState/SearchEmptyState'
import {
	Badge,
	Box,
	Button,
	Container,
	Form,
	Heading,
	IconSolidChartBar,
	IconSolidCheveronRight,
	IconSolidSearch,
	Input,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from 'react-use'

import {
	useGetVisualizationsQuery,
	useUpsertVisualizationMutation,
} from '@/graph/generated/hooks'
import { namedOperations } from '@/graph/generated/operations'
import { useProjectId } from '@/hooks/useProjectId'

import * as style from './DashboardOverview.css'

const ITEMS_PER_PAGE = 10

export default function DashboardOverview() {
	const { projectId } = useProjectId()

	const [query, setQuery] = useState('')
	const [debouncedQuery, setDebouncedQuery] = useState('')
	useDebounce(
		() => {
			setDebouncedQuery(query)
		},
		500,
		[query],
	)
	const [page, setPage] = useState(0)

	const { data, loading } = useGetVisualizationsQuery({
		variables: {
			project_id: projectId,
			input: debouncedQuery,
			count: ITEMS_PER_PAGE,
			offset: page * ITEMS_PER_PAGE,
		},
	})

	const [upsertViz] = useUpsertVisualizationMutation({
		variables: {
			visualization: {
				name: 'Untitled Dashboard',
				projectId: projectId,
			},
		},
		refetchQueries: [namedOperations.Query.GetVisualizations],
	})

	const navigate = useNavigate()

	const createDashboard = () => {
		upsertViz().then((result) => {
			if (result.data !== undefined && result.data !== null) {
				navigate(result.data.upsertVisualization)
			}
		})
	}

	const rows = data?.visualizations?.results

	return (
		<Box width="full" background="raised" p="8">
			<Box
				border="dividerWeak"
				borderRadius="6"
				width="full"
				shadow="medium"
				background="default"
				display="flex"
				flexDirection="column"
				height="full"
			>
				<Container display="flex" flexDirection="column" gap="24">
					<Box
						style={{ maxWidth: 560 }}
						my="40"
						mx="auto"
						width="full"
					>
						<Stack gap="24" width="full">
							<Stack gap="16" direction="column" width="full">
								<Heading mt="16" level="h4">
									Dashboards
								</Heading>
								<Text
									weight="medium"
									size="small"
									color="default"
								>
									Dashboards allow you to visualize what's
									happening in your app.
								</Text>
							</Stack>
							<Stack gap="8" width="full">
								<Box
									display="flex"
									justifyContent="space-between"
									alignItems="center"
									width="full"
								>
									<Text
										weight="bold"
										size="small"
										color="strong"
									>
										All dashboards
									</Text>
									<Button onClick={createDashboard}>
										Create new dashboard
									</Button>
								</Box>
								<Stack
									gap="0"
									border="dividerWeak"
									borderRadius="6"
								>
									<Form>
										<Box
											display="flex"
											gap="6"
											alignItems="center"
											cssClass={style.searchInputWrapper}
										>
											<IconSolidSearch />
											<Input
												type="text"
												name="title"
												placeholder="Search..."
												value={query}
												onChange={(e) => {
													setQuery(e.target.value)
												}}
												cssClass={style.searchInput}
											/>
										</Box>
									</Form>
									{rows && rows.length > 0 ? (
										<>
											{rows.map((row, idx) => (
												<Box
													width="full"
													display="flex"
													p="12"
													gap="16"
													key={idx}
												>
													<Box
														display="flex"
														alignItems="center"
														justifyContent="space-between"
														gap="8"
														key={idx}
													>
														<Box
															display="flex"
															alignItems="center"
															gap="4"
														>
															<Stack>
																<Box
																	display="flex"
																	gap="6"
																	alignItems="center"
																>
																	<Badge
																		color="weak"
																		iconStart={
																			<IconSolidChartBar />
																		}
																	/>
																	<Text
																		weight="medium"
																		size="small"
																		color="strong"
																	>
																		{
																			row.name
																		}
																	</Text>
																</Box>
																<Text
																	weight="medium"
																	size="small"
																	color="default"
																>
																	{row.name}
																</Text>
															</Stack>
														</Box>
														<Box
															display="flex"
															gap="8"
															flexShrink={0}
														>
															<Tag
																kind="primary"
																size="medium"
																shape="basic"
																emphasis="low"
																iconRight={
																	<IconSolidCheveronRight />
																}
																onClick={() =>
																	navigate(
																		`${row.id}`,
																	)
																}
															>
																View
															</Tag>
														</Box>
													</Box>
												</Box>
											))}
										</>
									) : (
										<SearchEmptyState
											className={style.emptyContainer}
											item="dashboards"
										/>
									)}
								</Stack>
							</Stack>
						</Stack>
					</Box>
				</Container>
			</Box>
		</Box>
	)
}
