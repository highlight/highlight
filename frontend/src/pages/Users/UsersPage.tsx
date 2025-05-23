import React, { useState, useMemo } from 'react'
import {
	Box,
	Card,
	Stack,
	Text,
	Table,
	Button,
	Menu,
	IconSolidDownload,
	IconSolidUser,
	IconSolidDotsHorizontal,
	DEFAULT_TIME_PRESETS,
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import { useSearchContext } from '@/components/Search/SearchContext'
import { useGetSessionUsersReportsQuery } from '@graph/hooks'
import {
	SearchForm,
	FixedRangePreset,
} from '@/components/Search/SearchForm/SearchForm'
import { SavedSegmentEntityType } from '@graph/schemas'
import { useRetentionPresets } from '@/components/Search/SearchForm/hooks'
import { ProductType } from '@graph/schemas'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'
import { useGetWorkspaceSettingsQuery } from '@graph/hooks'
import analytics from '@util/analytics'
import { SearchContext } from '@/components/Search/SearchContext'
import { useSearchTime } from '@/hooks/useSearchTime'
import { Helmet } from 'react-helmet'
import { Avatar } from '@/components/Avatar/Avatar'
import moment from 'moment'

// Default columns for the users table
const DEFAULT_COLUMNS = [
	{
		key: 'user',
		label: 'User',
		width: 250,
	},
	{
		key: 'location',
		label: 'Location',
		width: 150,
	},
	{
		key: 'numSessions',
		label: 'Sessions',
		width: 100,
	},
	{
		key: 'firstSession',
		label: 'First Session',
		width: 180,
	},
	{
		key: 'lastSession',
		label: 'Last Session',
		width: 180,
	},
	{
		key: 'numDaysVisited',
		label: 'Days Visited',
		width: 120,
	},
	{
		key: 'numMonthsVisited',
		label: 'Months Visited',
		width: 120,
	},
	{
		key: 'totalActiveLength',
		label: 'Total Active Time',
		width: 150,
	},
	{
		key: 'avgActiveLength',
		label: 'Avg Active Time',
		width: 150,
	},
]

interface UserData {
	email: string
	location: string
	num_sessions: number
	first_session: string
	last_session: string
	num_days_visited: number
	num_months_visited: number
	total_active_length: string
	avg_active_length: string
	total_active_length_mins: number
	avg_active_length_mins: number
	[key: string]: string | number
}

const UsersPage: React.FC = () => {
	const { projectId } = useProjectId()
	const { currentWorkspace } = useApplicationContext()

	const {
		initialQuery,
		startDate,
		endDate,
		updateSearchTime,
		selectedPreset,
	} = useSearchContext()

	const searchTimeContext = useSearchTime({
		presets: DEFAULT_TIME_PRESETS,
		initialPreset: FixedRangePreset,
	})

	const [sortField, setSortField] = useState<string>('num_sessions')
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

	// Get workspace settings for AI features
	const { data: workspaceSettings } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: String(currentWorkspace?.id) },
		skip: !currentWorkspace?.id,
	})

	// Get users data
	const { data, loading } = useGetSessionUsersReportsQuery({
		variables: {
			project_id: projectId!,
			params: {
				query: initialQuery,
				date_range: {
					start_date: startDate!.toISOString(),
					end_date: endDate!.toISOString(),
				},
			},
		},
		skip: !projectId || !startDate || !endDate,
		fetchPolicy: 'network-only',
	})

	// Get presets for date range selection
	const { presets, minDate } = useRetentionPresets(ProductType.Sessions)

	// Format user data for display
	const sortedUsers = useMemo(() => {
		if (!data?.session_users_report) return []

		const users: UserData[] = data.session_users_report.map((user) => ({
			...user,
			first_session: moment(user.first_session).format(
				'MMM D, YYYY h:mm A',
			),
			last_session: moment(user.last_session).format(
				'MMM D, YYYY h:mm A',
			),
			total_active_length: moment
				.duration(user.total_active_length_mins * 60000)
				.humanize(),
			avg_active_length: moment
				.duration(user.avg_active_length_mins * 60000)
				.humanize(),
		}))

		return users.sort((a, b) => {
			const aValue = Number(a[sortField]) || 0
			const bValue = Number(b[sortField]) || 0
			return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
		})
	}, [data, sortField, sortOrder])

	// Handle CSV export
	const handleExportCSV = () => {
		if (!sortedUsers.length) return

		const csvData = sortedUsers.map((user) => ({
			Email: user.email,
			Location: user.location,
			'Number of Sessions': user.num_sessions,
			'First Session': user.first_session,
			'Last Session': user.last_session,
			'Days Visited': user.num_days_visited,
			'Months Visited': user.num_months_visited,
			'Total Active Time': user.total_active_length,
			'Average Active Time': user.avg_active_length,
		}))

		const csvContent =
			'data:text/csv;charset=utf-8,' +
			Object.keys(csvData[0]).join(',') +
			'\n' +
			csvData.map((row) => Object.values(row).join(',')).join('\n')

		const encodedUri = encodeURI(csvContent)
		const link = document.createElement('a')
		link.setAttribute('href', encodedUri)
		link.setAttribute('download', 'users_report.csv')
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)

		analytics.track('Export Users CSV', {
			filename: 'users_report.csv',
		})
	}

	return (
		<SearchContext
			initialQuery={initialQuery}
			onSubmit={(_query: string) => {
				if (updateSearchTime) {
					updateSearchTime(startDate!, endDate!, undefined)
				}
			}}
			{...searchTimeContext}
		>
			<Helmet>
				<title>Users</title>
			</Helmet>

			<Box
				display="flex"
				flexDirection="column"
				width="full"
				height="full"
			>
				<Box p="8" borderBottom="secondary">
					<SearchForm
						startDate={startDate!}
						endDate={endDate!}
						onDatesChange={updateSearchTime!}
						presets={presets}
						minDate={minDate}
						selectedPreset={selectedPreset}
						productType={ProductType.Sessions}
						timeMode="fixed-range"
						savedSegmentType={SavedSegmentEntityType.Session}
						actions={() => (
							<Box display="flex" gap="2">
								<Button
									iconLeft={<IconSolidDownload size={16} />}
									kind="secondary"
									emphasis="medium"
									onClick={handleExportCSV}
									disabled={sortedUsers.length === 0}
								>
									Export CSV
								</Button>
							</Box>
						)}
						enableAIMode={
							workspaceSettings?.workspaceSettings
								?.ai_query_builder
						}
						aiSupportedSearch
						hideCreateAlert
					/>
				</Box>

				<Box p="8" flexGrow="1" overflow="auto">
					<Stack gap="4">
						<Box
							display="flex"
							justifyContent="space-between"
							alignItems="center"
						>
							<Text level="2">
								<Box display="flex" alignItems="center" gap="2">
									<IconSolidUser size={20} />
									Users
								</Box>
							</Text>
							<Text>{sortedUsers.length} users</Text>
						</Box>

						<Card padding="none">
							{loading ? (
								<Box
									p="8"
									display="flex"
									justifyContent="center"
								>
									<Loader />
								</Box>
							) : sortedUsers.length === 0 ? (
								<Box p="8" textAlign="center">
									<Text>
										No users found with the current filters.
									</Text>
								</Box>
							) : (
								<Table>
									<Table.Head>
										{DEFAULT_COLUMNS.map((column) => (
											<Table.Cell
												key={column.key}
												style={{ width: column.width }}
												onClick={() => {
													if (
														column.key === sortField
													) {
														setSortOrder(
															sortOrder === 'asc'
																? 'desc'
																: 'asc',
														)
													} else {
														setSortField(column.key)
														setSortOrder('desc')
													}
												}}
											>
												<Stack
													direction="row"
													gap="2"
													align="center"
												>
													<Text>{column.label}</Text>
												</Stack>
											</Table.Cell>
										))}
									</Table.Head>
									<Table.Body>
										{loading ? (
											<Table.Row>
												<Table.Cell
													colSpan={
														DEFAULT_COLUMNS.length
													}
												>
													<Box
														p="4"
														display="flex"
														justifyContent="center"
													>
														<Text>Loading...</Text>
													</Box>
												</Table.Cell>
											</Table.Row>
										) : (
											sortedUsers.map((user) => (
												<Table.Row key={user.email}>
													<Table.Cell>
														<Stack
															direction="row"
															gap="2"
															align="center"
														>
															<Avatar
																size="small"
																alt={user.email}
															/>
															<Text>
																{user.email}
															</Text>
														</Stack>
													</Table.Cell>
													<Table.Cell>
														<Text>
															{user.location}
														</Text>
													</Table.Cell>
													<Table.Cell>
														<Text>
															{user.num_sessions}
														</Text>
													</Table.Cell>
													<Table.Cell>
														<Text>
															{user.first_session}
														</Text>
													</Table.Cell>
													<Table.Cell>
														<Text>
															{user.last_session}
														</Text>
													</Table.Cell>
													<Table.Cell>
														<Text>
															{
																user.num_days_visited
															}
														</Text>
													</Table.Cell>
													<Table.Cell>
														<Text>
															{
																user.num_months_visited
															}
														</Text>
													</Table.Cell>
													<Table.Cell>
														<Text>
															{
																user.total_active_length
															}
														</Text>
													</Table.Cell>
													<Table.Cell>
														<Text>
															{
																user.avg_active_length
															}
														</Text>
													</Table.Cell>
													<Table.Cell>
														<Menu>
															<Menu.Button
																icon={
																	<IconSolidDotsHorizontal
																		size={
																			14
																		}
																	/>
																}
																kind="ghost"
																emphasis="low"
																size="small"
															/>
															<Menu.List>
																<Menu.Item
																	onClick={() => {
																		// Navigate to sessions filtered by this user
																		const userQuery = `email:${user.email}`
																		window.open(
																			`/${projectId}/sessions?q=${encodeURIComponent(userQuery)}`,
																			'_blank',
																		)
																	}}
																>
																	View
																	Sessions
																</Menu.Item>
																<Menu.Item
																	onClick={() => {
																		// Navigate to a stats view focused on this user
																		window.open(
																			`/${projectId}/dashboards?user=${encodeURIComponent(user.email)}`,
																			'_blank',
																		)
																	}}
																>
																	View Stats
																</Menu.Item>
															</Menu.List>
														</Menu>
													</Table.Cell>
												</Table.Row>
											))
										)}
									</Table.Body>
								</Table>
							)}
						</Card>
					</Stack>
				</Box>
			</Box>
		</SearchContext>
	)
}

export default UsersPage
