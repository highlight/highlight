import { useAuthContext } from '@authentication/AuthContext'
import { Box, Stack, Text } from '@highlight-run/ui'
import { SetupDocs } from '@pages/Setup/SetupDocs'
import { SetupOptionsList } from '@pages/Setup/SetupOptionsList'
import SetupPage from '@pages/Setup/SetupPage'
import analytics from '@util/analytics'
import { message } from 'antd'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useMatch } from 'react-router-dom'

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

export type Guides = {
	client: {
		[key: string]: Guide
	}
	server: {
		[key: string]: {
			[key: string]: Guide
		}
	}
	['server-logging']: {
		[key: string]: {
			[key: string]: Guide
		}
	}
	other: {
		[key: string]: Guide
	}
}

type Props = {
	integrated: boolean
}

const SetupRouter = ({ integrated }: Props) => {
	const { isHighlightAdmin } = useAuthContext()
	const [docs, setDocs] = useState<Guides>()
	const uxDocsMatch = useMatch('/setup/ux/:step')
	console.log('::: uxDocsMatch', uxDocsMatch)

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
					element={<SetupPage integrated={integrated} />}
				/>
				<Route
					path=":step"
					element={<SetupPage integrated={integrated} />}
				/>
			</Routes>
		)
	}

	const optionsList = <SetupOptionsList docs={docs} integrated={integrated} />
	const docsPage = <SetupDocs docs={docs} integrated={integrated} />

	return (
		<Box display="flex" flexDirection="row" flexGrow={1}>
			<Stack justify="space-between" p="8">
				<Stack gap="0">
					<NavLink
						// TODO: Now all docs will be at language/framework
						to="client/js"
						className={({ isActive }) =>
							clsx(styles.menuItem, {
								[styles.menuItemActive]: isActive,
							})
						}
					>
						<Text>UX Monitoring</Text>
					</NavLink>
					<NavLink
						to="server"
						className={({ isActive }) =>
							clsx(styles.menuItem, {
								[styles.menuItemActive]: isActive,
							})
						}
					>
						<Text>Server Monitoring</Text>
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
						to="alerts"
						className={({ isActive }) =>
							clsx(styles.menuItem, {
								[styles.menuItemActive]: isActive,
							})
						}
					>
						<Text>Add integrations & alerts</Text>
					</NavLink>
					<NavLink
						to="team"
						className={({ isActive }) =>
							clsx(styles.menuItem, {
								[styles.menuItemActive]: isActive,
							})
						}
					>
						<Text>Invite team</Text>
					</NavLink>
					<NavLink
						to="community"
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
					boxShadow="small"
					flexGrow={1}
					overflowY="scroll"
				>
					<Routes>
						<Route path=":area/:language?" element={optionsList} />
						<Route
							path=":area/:language/:framework"
							element={docsPage}
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
