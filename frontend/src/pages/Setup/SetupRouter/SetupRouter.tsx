import LoadingBox from '@components/LoadingBox'
import { useGetProjectQuery } from '@graph/hooks'
import {
	Badge,
	Box,
	ButtonIcon,
	IconSolidCheckCircle,
	IconSolidClipboard,
	IconSolidGlobe,
	IconSolidUserAdd,
	IconSolidViewGridAdd,
	Stack,
	Tag,
	Text,
	vars,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { SetupDocs } from '@pages/Setup/SetupDocs'
import { SetupOptionsList } from '@pages/Setup/SetupOptionsList'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import analytics from '@util/analytics'
import { useClientIntegrated, useServerIntegrated } from '@util/integrated'
import { message } from 'antd'
import clsx from 'clsx'
import { H } from 'highlight.run'
import React, { useEffect, useState } from 'react'
import {
	Link,
	Navigate,
	NavLink,
	Route,
	Routes,
	useLocation,
	useMatch,
} from 'react-router-dom'

import * as styles from './SetupRouter.css'

export type Guide = {
	title: string
	subtitle: string
	logoUrl: string
	entries: Array<{
		title: string
		content: string
		code?: {
			text: string
			language: string
		}
	}>
}

type DocsKey = 'client' | 'backend' | 'backend-logging'
export type DocsSection = {
	title: string
	subtitle: string
} & {
	[key: string]: {
		title: string
		subtitle: string
	} & {
		[key: string]: Guide
	}
}

export type Guides = {
	[key in DocsKey]: DocsSection
} & {
	other: {
		[key: string]: Guide
	}
}

const SetupRouter = () => {
	const { toggleShowBanner } = useGlobalContext()
	const { data: serverIntegration } = useServerIntegrated()
	const { data: clientIntegration } = useClientIntegrated()
	const areaMatch = useMatch('/:project_id/setup/:area/*')
	const area = areaMatch?.params.area || 'client'
	const integrationData =
		area === 'backend'
			? serverIntegration
			: area === 'client'
			? clientIntegration
			: undefined
	const { projectId } = useProjectId()
	const [docs, setDocs] = useState<Guides>()
	const { data } = useGetProjectQuery({ variables: { id: projectId! } })
	const projectVerboseId = data?.project?.verbose_id
	const location = useLocation()

	toggleShowBanner(false)

	useEffect(() => analytics.page(), [])

	useEffect(() => {
		fetch(`https://www.highlight.io/api/quickstart`)
			.then((res) => res.json())
			.then((docs) => setDocs(docs))
			.catch((e) => {
				H.consumeError(e, 'Error loading docs')

				message.error(
					'Error loading the documentation. Please reload the page...',
				)
			})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (!docs || !projectVerboseId) {
		return <LoadingBox />
	}

	const copyProjectId = () => {
		window.navigator.clipboard.writeText(projectVerboseId!)
		message.success('Project ID copied to your clipboard!')
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
						<Stack direction="row" align="center" gap="4">
							{clientIntegration?.firstSessionSecureId && (
								<IconSolidCheckCircle />
							)}
							<Text>UX monitoring</Text>
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
						<Stack direction="row" align="center" gap="4">
							{serverIntegration?.firstErrorGroupSecureId && (
								<IconSolidCheckCircle />
							)}
							<Text>Backend error monitoring</Text>
						</Stack>
					</NavLink>
					<Box
						className={clsx(
							styles.menuItem,
							styles.menuItemDisabled,
						)}
					>
						<Stack
							direction="row"
							justify="space-between"
							align="center"
						>
							<Text>Logging</Text>
							<Badge label="Soon" variant="outlineGray" />
						</Stack>
					</Box>
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
						to={`/${projectId}/alerts`}
						className={styles.menuItemSecondary}
					>
						<IconSolidViewGridAdd
							color={vars.theme.static.content.weak}
						/>
						<Text>Add integrations & alerts</Text>
					</Link>
					<Link to="/w/team" className={styles.menuItemSecondary}>
						<IconSolidUserAdd
							color={vars.theme.static.content.weak}
						/>
						<Text>Invite team</Text>
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
					overflowY="scroll"
					position="relative"
				>
					<Routes>
						<Route
							path=":area/:language?"
							element={
								<SetupOptionsList
									docs={docs}
									integrationData={integrationData}
								/>
							}
						/>
						<Route
							path=":area/:language/:framework"
							element={
								<SetupDocs
									docs={docs}
									projectVerboseId={projectVerboseId}
									integrationData={integrationData}
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
	)
}

export default SetupRouter
