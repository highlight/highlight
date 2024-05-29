import LoadingBox from '@components/LoadingBox'
import { toast } from '@components/Toaster'
import { useGetProjectQuery } from '@graph/hooks'
import {
	Box,
	ButtonIcon,
	IconSolidBell,
	IconSolidCheckCircle,
	IconSolidClipboard,
	IconSolidDesktopComputer,
	IconSolidGlobe,
	IconSolidLogs,
	IconSolidSparkles,
	IconSolidTerminal,
	IconSolidUserAdd,
	IconSolidViewGridAdd,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { useProjectId } from '@hooks/useProjectId'
import { SetupDocs } from '@pages/Setup/SetupDocs'
import { SetupOptionsList } from '@pages/Setup/SetupOptionsList'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import analytics from '@util/analytics'
import clsx from 'clsx'
import { useEffect } from 'react'
import {
	Link,
	Navigate,
	NavLink,
	Route,
	Routes,
	useLocation,
	useMatch,
} from 'react-router-dom'

import { IntegrationBar } from '@/pages/Setup/IntegrationBar'
import {
	useAlertsIntegration,
	useClientIntegration,
	useLogsIntegration,
	useServerIntegration,
	useTeamIntegration,
	useTracesIntegration,
} from '@/util/integrated'

import { AlertsSetup } from './AlertsSetup'
import * as styles from './SetupRouter.css'

export const SetupRouter = () => {
	const { toggleShowBanner } = useGlobalContext()
	const areaMatch = useMatch('/:project_id/setup/:area/*')
	const area = areaMatch?.params.area || 'client'
	const clientIntegration = useClientIntegration()
	const serverIntegration = useServerIntegration()
	const logsIntegration = useLogsIntegration()
	const tracesIntegration = useTracesIntegration()
	const alertsIntegration = useAlertsIntegration()
	const teamIntegration = useTeamIntegration()
	const integrationData =
		area === 'backend'
			? serverIntegration
			: area === 'client'
			? clientIntegration
			: area === 'backend-logging'
			? logsIntegration
			: area === 'alerts'
			? alertsIntegration
			: area === 'team'
			? teamIntegration
			: area === 'traces'
			? tracesIntegration
			: undefined
	const { projectId } = useProjectId()
	const { data } = useGetProjectQuery({ variables: { id: projectId! } })
	const projectVerboseId = data?.project?.verbose_id
	const location = useLocation()

	toggleShowBanner(false)

	useEffect(() => analytics.page('Setup'), [])

	if (!projectVerboseId) {
		return <LoadingBox />
	}

	const copyProjectId = () => {
		window.navigator.clipboard.writeText(projectVerboseId!)
		toast.success('Project ID copied to your clipboard!')
	}

	return (
		<Box
			display="flex"
			flexDirection="row"
			flexGrow={1}
			backgroundColor="raised"
		>
			<Stack justify="space-between" p="8">
				<Stack gap="0">
					<Box cssClass={styles.copyProjectIdIdButton}>
						<Stack direction="row" gap="6" align="center">
							<Text color="weak" size="xSmall">
								Project ID:
							</Text>
							<Tag
								kind="secondary"
								emphasis="low"
								shape="basic"
								onClick={copyProjectId}
							>
								{projectVerboseId}
							</Tag>
						</Stack>
						<ButtonIcon
							kind="secondary"
							emphasis="low"
							icon={<IconSolidClipboard />}
							onClick={copyProjectId}
						/>
					</Box>
					<NavLink
						to="client/js"
						className={({ isActive }) =>
							clsx(styles.menuItem, {
								[styles.menuItemActive]: isActive,
							})
						}
					>
						<Stack
							direction="row"
							align="center"
							justify="space-between"
							pr="8"
						>
							<Stack direction="row" align="center" gap="4">
								<IconSolidDesktopComputer />
								<Text>
									Frontend monitoring + session replay
								</Text>
							</Stack>
							{clientIntegration?.integrated && (
								<IconSolidCheckCircle />
							)}
						</Stack>
					</NavLink>
					<NavLink
						to="backend"
						className={({ isActive }) =>
							clsx(styles.menuItem, {
								[styles.menuItemActive]: isActive,
							})
						}
					>
						<Stack
							direction="row"
							align="center"
							justify="space-between"
							pr="8"
						>
							<Stack direction="row" align="center" gap="4">
								<IconSolidTerminal />
								<Text>Backend error monitoring</Text>
							</Stack>
							{serverIntegration?.integrated && (
								<IconSolidCheckCircle />
							)}
						</Stack>
					</NavLink>
					<NavLink
						to="backend-logging"
						className={({ isActive }) =>
							clsx(styles.menuItem, {
								[styles.menuItemActive]: isActive,
							})
						}
					>
						<Stack
							direction="row"
							align="center"
							justify="space-between"
							pr="8"
						>
							<Stack direction="row" align="center" gap="4">
								<IconSolidLogs />
								<Text>Logging</Text>
							</Stack>
							{logsIntegration?.integrated && (
								<IconSolidCheckCircle />
							)}
						</Stack>
					</NavLink>
					<NavLink
						to="traces"
						className={({ isActive }) =>
							clsx(styles.menuItem, {
								[styles.menuItemActive]: isActive,
							})
						}
					>
						<Stack
							direction="row"
							align="center"
							justify="space-between"
							pr="8"
						>
							<Stack direction="row" align="center" gap="4">
								<IconSolidSparkles />
								<Text>Traces</Text>
							</Stack>
							{tracesIntegration?.integrated && (
								<IconSolidCheckCircle />
							)}
						</Stack>
					</NavLink>
					<NavLink
						to="alerts"
						className={({ isActive }) =>
							clsx(styles.menuItem, {
								[styles.menuItemActive]: isActive,
							})
						}
					>
						<Stack
							direction="row"
							align="center"
							justify="space-between"
							pr="8"
						>
							<Stack direction="row" align="center" gap="4">
								<IconSolidBell />
								<Text>Add alerts</Text>
							</Stack>
							{alertsIntegration?.integrated && (
								<IconSolidCheckCircle />
							)}
						</Stack>
					</NavLink>
					<NavLink
						to="/w/team"
						className={({ isActive }) =>
							clsx(styles.menuItem, {
								[styles.menuItemActive]: isActive,
							})
						}
					>
						<Stack
							direction="row"
							align="center"
							justify="space-between"
							pr="8"
						>
							<Stack direction="row" align="center" gap="4">
								<IconSolidUserAdd />
								<Text>Invite team</Text>
							</Stack>
							{teamIntegration?.integrated && (
								<IconSolidCheckCircle />
							)}
						</Stack>
					</NavLink>
				</Stack>

				<Stack gap="0">
					<Box mb="10" ml="8">
						<Text
							weight="bold"
							size="xxSmall"
							color="secondaryContentText"
						>
							More stuff
						</Text>
					</Box>
					<Link
						to={`/${projectId}/integrations`}
						className={styles.menuItemSecondary}
					>
						<IconSolidViewGridAdd
							color={vars.theme.static.content.weak}
						/>
						<Text>Enable integrations</Text>
					</Link>
					<Link
						to="https://discord.gg/yxaXEAqgwN"
						target="_blank"
						className={styles.menuItemSecondary}
					>
						<IconSolidGlobe
							color={vars.theme.static.content.weak}
						/>
						<Text>Join community</Text>
					</Link>
				</Stack>
			</Stack>

			<Box flexGrow={1} display="flex" flexDirection="column">
				<Box
					mt="8"
					mr="8"
					mb="8"
					backgroundColor="white"
					border="secondary"
					borderRadius="6"
					boxShadow="medium"
					flexGrow={1}
					position="relative"
					overflow="hidden"
				>
					<IntegrationBar integrationData={integrationData} />

					<Box overflowY="scroll" height="full">
						<Routes>
							<Route
								path="alerts/:platform?"
								element={<AlertsSetup />}
							/>
							<Route
								path=":area/:language?"
								element={<SetupOptionsList />}
							/>
							<Route
								path=":area/:language/:framework"
								element={
									<SetupDocs
										projectVerboseId={projectVerboseId}
									/>
								}
							/>

							{/* Redirect to default docs. */}
							<Route
								path="*"
								element={
									<Navigate
										to="client/js"
										replace={true}
										state={location.state}
									/>
								}
							/>
						</Routes>
					</Box>
				</Box>
			</Box>
		</Box>
	)
}
