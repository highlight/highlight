import EnterpriseFeatureButton from '@components/Billing/EnterpriseFeatureButton'
import { toast } from '@components/Toaster'
import {
	Badge,
	Box,
	Button,
	Callout,
	Container,
	Heading,
	IconSolidChartBar,
	IconSolidDotsHorizontal,
	IconSolidTrash,
	Menu,
	Stack,
	Table,
	Text,
} from '@highlight-run/ui/components'
import useLocalStorage from '@rehooks/local-storage'
import moment from 'moment'
import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from 'react-use'

import { LinkButton } from '@/components/LinkButton'
import LoadingBox from '@/components/LoadingBox'
import { SearchEmptyState } from '@/components/SearchEmptyState/SearchEmptyState'
import {
	useDeleteVisualizationMutation,
	useGetVisualizationsQuery,
} from '@/graph/generated/hooks'
import {
	GetVisualizationsQuery,
	namedOperations,
} from '@/graph/generated/operations'
import { useProjectId } from '@/hooks/useProjectId'
import { CreateDashboardModal } from '@/pages/Graphing/components/CreateDashboardModal'

import * as style from './DashboardOverview.css'

const ITEMS_PER_PAGE = 10

const METRICS_DOCS_LINK =
	'https://www.highlight.io/docs/general/product-features/metrics/overview'

export const DashboardOverview: React.FC = () => {
	const { projectId } = useProjectId()
	const [visible, setVisible] = useLocalStorage<boolean>(
		'display-dashboard-docs-callout',
		true,
	)

	const [query, setQuery] = useState('')
	const [debouncedQuery, setDebouncedQuery] = useState('')
	useDebounce(
		() => {
			setPage(0)
			setDebouncedQuery(query)
		},
		300,
		[query],
	)
	const [page, setPage] = useState(0)
	const [showModal, setShowModal] = useState(false)

	const { data, loading } = useGetVisualizationsQuery({
		variables: {
			project_id: projectId,
			input: debouncedQuery,
			count: ITEMS_PER_PAGE,
			offset: page * ITEMS_PER_PAGE,
		},
	})

	const count = data?.visualizations.count ?? 0
	const hasPrev = page > 0
	const hasNext = (page + 1) * ITEMS_PER_PAGE < count

	const navigate = useNavigate()

	return (
		<>
			<Helmet>
				<title>Metrics</title>
			</Helmet>
			<Box width="full" background="raised" p="8">
				<CreateDashboardModal
					showModal={showModal}
					onHideModal={() => {
						setShowModal(false)
					}}
					afterCreateHandler={(id) => {
						navigate(id)
					}}
				/>
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
										Metrics
									</Heading>
									<Text
										weight="medium"
										size="small"
										color="default"
									>
										Metrics allow you to visualize what's
										happening in your app. Understand error
										rates, APM trends, and user engagement.
										Learn more about building dashboards{' '}
										<a href={METRICS_DOCS_LINK}>here</a>.
									</Text>
									{visible && (
										<Callout
											title="Want to learn more about
												Metrics?"
											icon={false}
											handleCloseClick={() =>
												setVisible(false)
											}
										>
											<Stack gap="16">
												<Text>
													Be sure to take a look at
													the docs, or watch the
													walkthrough video!
												</Text>
												<Box>
													<LinkButton
														kind="secondary"
														emphasis="high"
														trackingId="dashboard-read-docs"
														to={METRICS_DOCS_LINK}
													>
														Learn more
													</LinkButton>
												</Box>
											</Stack>
										</Callout>
									)}
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
										<EnterpriseFeatureButton
											setting="enable_business_dashboards"
											name="More than 2 dashboards"
											fn={async () => {
												setShowModal(true)
											}}
											variant="basic"
										>
											<Box mt="8">
												<Stack
													mb="8"
													align="center"
													justify="space-between"
													direction="row"
												>
													<Button>
														Create new dashboard
													</Button>
												</Stack>
											</Box>
										</EnterpriseFeatureButton>
									</Box>
									<Table>
										<Table.Search
											placeholder="Search..."
											handleChange={(e) => {
												setQuery(e.target.value)
											}}
										/>
										<Table.Body>
											<DashboardRows
												data={data}
												loading={loading}
											/>
										</Table.Body>
									</Table>
									<Box
										display="flex"
										justifyContent="space-between"
										alignItems="center"
									>
										<Text size="xSmall" color="weak">
											{loading ? '-' : count} result
											{count !== 1 ? 's' : ''}
										</Text>
										<Box display="flex" gap="4">
											<Button
												disabled={!hasPrev || loading}
												onClick={() => {
													setPage((p) => p - 1)
												}}
												kind="secondary"
												emphasis="high"
											>
												Previous
											</Button>
											<Button
												disabled={!hasNext || loading}
												onClick={() => {
													setPage((p) => p + 1)
												}}
												kind="secondary"
												emphasis="high"
											>
												Next
											</Button>
										</Box>
									</Box>
								</Stack>
							</Stack>
						</Box>
					</Container>
				</Box>
			</Box>
		</>
	)
}

const DashboardRow = ({
	row,
}: {
	row: GetVisualizationsQuery['visualizations']['results'][number]
}) => {
	const [hover, setHover] = useState(false)

	const [deleteViz, deleteContext] = useDeleteVisualizationMutation({
		variables: {
			id: row.id,
		},
		refetchQueries: [namedOperations.Query.GetVisualizations],
	})

	const navigate = useNavigate()

	return (
		<Table.Row
			width="full"
			onMouseEnter={() => {
				setHover(true)
			}}
			onMouseLeave={() => {
				setHover(false)
			}}
			onClick={() => {
				navigate(`${row.id}`)
			}}
		>
			<Stack direction="row" alignItems="center" px="12" py="8">
				<Stack width="full" gap="2">
					<Box display="flex" gap="6" alignItems="center">
						<Badge color="weak" iconStart={<IconSolidChartBar />} />
						<Text weight="medium" size="small" color="strong">
							{row.name}
						</Text>
					</Box>
					<Box>
						<Text color="weak" display="inline-block">
							Updated by&nbsp;
						</Text>
						<Text
							color="secondaryContentText"
							display="inline-block"
						>
							{row.updatedByAdmin?.name ?? 'Highlight'}
							&nbsp;
						</Text>
						<Text color="weak" display="inline-block">
							{moment(row.updatedAt).fromNow()}
						</Text>
					</Box>
				</Stack>
				{hover && (
					<Menu>
						<Menu.Button
							size="medium"
							emphasis="low"
							kind="secondary"
							iconLeft={<IconSolidDotsHorizontal />}
							onClick={(e: any) => {
								e.stopPropagation()
							}}
						/>
						<Menu.List>
							<Menu.Item disabled={deleteContext.loading}>
								<Box
									display="flex"
									alignItems="center"
									gap="4"
									onClick={(e) => {
										e.stopPropagation()
										deleteViz()
											.then(() =>
												toast.success(
													'Dashboard deleted',
												),
											)
											.catch(() =>
												toast.error(
													'Failed to delete dashboard',
												),
											)
									}}
								>
									<IconSolidTrash />
									Delete dashboard
								</Box>
							</Menu.Item>
						</Menu.List>
					</Menu>
				)}
			</Stack>
		</Table.Row>
	)
}

const DashboardRows = ({
	data,
	loading,
}: {
	data: GetVisualizationsQuery | undefined
	loading: boolean
}) => {
	const rows = data?.visualizations?.results

	if (loading) {
		return (
			<Table.Row>
				<LoadingBox width={560} height={326} />
			</Table.Row>
		)
	}

	if (rows?.length === undefined || rows?.length === 0) {
		return (
			<Table.Row>
				<SearchEmptyState
					className={style.emptyContainer}
					item="dashboards"
				/>
			</Table.Row>
		)
	}

	return (
		<>
			{rows.map((row) => (
				<DashboardRow key={row.id} row={row} />
			))}
		</>
	)
}
