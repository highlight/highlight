import { useAuthContext } from '@authentication/AuthContext'
import { Box, IconSolidCheckCircle, Stack, Text } from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { SetupDocs } from '@pages/Setup/SetupDocs'
import { SetupOptionsList } from '@pages/Setup/SetupOptionsList'
import SetupPage from '@pages/Setup/SetupPage'
import analytics from '@util/analytics'
import { useBackendIntegrated } from '@util/integrated'
import { message } from 'antd'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'

import * as styles from './SetupRouter.css'

export type Guide = {
	title: string
	subtitle: string
	logoUrl: string // TODO: Add in docs
	entries: Array<{
		title: string
		content: string
		code?: {
			text: string
			language: string
		}
	}>
}

type DocsKey = 'client' | 'server' | 'server-logging'
export type DocsSection = {
	title: string
	description: string
} & {
	[key: string]: {
		title: string
		description: string
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

type Props = {
	clientIntegrated: boolean
}

const SetupRouter = ({ clientIntegrated }: Props) => {
	const { integrated: serverIntegrated, loading: serverIntegratedLoading } =
		useBackendIntegrated()
	const { projectId } = useProjectId()
	const { isHighlightAdmin } = useAuthContext()
	const [docs, setDocs] = useState<Guides>()

	useEffect(() => analytics.page(), [])

	useEffect(() => {
		// fetch(`https://www.highlight.io/api/quickstart`)
		fetch(`http://localhost:3001/api/quickstart`)
			.then((res) => res.json())
			.then((docs) => setDocs(docs))
			.catch(() => message.error('Error loading docs...'))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (!docs) return null

	if (!isHighlightAdmin) {
		return (
			<Routes>
				<Route
					path="*"
					element={
						<SetupPage
							clientIntegrated={clientIntegrated}
							serverIntegrated={serverIntegrated}
							serverIntegratedLoading={serverIntegratedLoading}
						/>
					}
				/>
				<Route
					path=":step"
					element={
						<SetupPage
							clientIntegrated={clientIntegrated}
							serverIntegrated={serverIntegrated}
							serverIntegratedLoading={serverIntegratedLoading}
						/>
					}
				/>
			</Routes>
		)
	}

	return (
		<Box display="flex" flexDirection="row" flexGrow={1}>
			<Stack justify="space-between" p="8">
				<Stack gap="0">
					<NavLink
						to="client/js"
						className={({ isActive }) =>
							clsx(styles.menuItem, {
								[styles.menuItemActive]: isActive,
							})
						}
					>
						<Stack direction="row" align="center" gap="4">
							{clientIntegrated && <IconSolidCheckCircle />}
							<Text>UX monitoring</Text>
						</Stack>
					</NavLink>
					<NavLink
						to="server"
						className={({ isActive }) =>
							clsx(styles.menuItem, {
								[styles.menuItemActive]: isActive,
							})
						}
					>
						<Stack direction="row" align="center" gap="4">
							{serverIntegrated && <IconSolidCheckCircle />}
							<Text>Server monitoring</Text>
						</Stack>
					</NavLink>
					<NavLink
						to="server-logging"
						className={({ isActive }) =>
							clsx(styles.menuItem, {
								[styles.menuItemActive]: isActive,
							})
						}
					>
						<Text>Logging</Text>
					</NavLink>
				</Stack>

				<Stack gap="0">
					<Box mb="10" ml="12">
						<Text weight="bold">More stuff</Text>
					</Box>
					<NavLink
						to={`/${projectId}/alerts`}
						className={({ isActive }) =>
							clsx(styles.menuItem, {
								[styles.menuItemActive]: isActive,
							})
						}
					>
						<Text>Add integrations & alerts</Text>
					</NavLink>
					<NavLink
						to="/w/team"
						className={({ isActive }) =>
							clsx(styles.menuItem, {
								[styles.menuItemActive]: isActive,
							})
						}
					>
						<Text>Invite team</Text>
					</NavLink>
					<NavLink
						to="https://discord.gg/yxaXEAqgwN"
						target="_blank"
						className={({ isActive }) =>
							clsx(styles.menuItem, {
								[styles.menuItemActive]: isActive,
							})
						}
					>
						<Text>Join community</Text>
					</NavLink>
				</Stack>
			</Stack>
			<Box flexGrow={1} display="flex" flexDirection="column">
				<Box
					m="10"
					border="secondary"
					borderRadius="6"
					boxShadow="medium"
					flexGrow={1}
					overflowY="scroll"
				>
					<Routes>
						<Route
							path=":area/:language?"
							element={
								<SetupOptionsList
									docs={docs}
									clientIntegrated={clientIntegrated}
									serverIntegrated={serverIntegrated}
								/>
							}
						/>
						<Route
							path=":area/:language/:framework"
							element={
								<SetupDocs
									docs={docs}
									clientIntegrated={clientIntegrated}
									serverIntegrated={serverIntegrated}
								/>
							}
						/>

						{/* Redirect to default docs. */}
						<Route
							path="*"
							element={<Navigate to="client/js" replace={true} />}
						/>
					</Routes>
				</Box>
			</Box>
		</Box>
	)
}

export default SetupRouter
