import { useAuthContext } from '@authentication/AuthContext'
import { Box, Stack, Text } from '@highlight-run/ui'
import { SetupDocs } from '@pages/Setup/SetupDocs'
import { SetupOptionsList } from '@pages/Setup/SetupOptionsList'
import SetupPage from '@pages/Setup/SetupPage'
import analytics from '@util/analytics'
import { message } from 'antd'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { Link, Route, Routes, useMatch } from 'react-router-dom'

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
		fetch(`https://www.highlight.io/api/quickstart`)
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

	return (
		<Box display="flex" flexDirection="row" flexGrow={1}>
			<Stack justify="space-between" p="8">
				<Stack gap="0">
					<Link to="client" className={styles.menuItem}>
						<Text>UX Monitoring</Text>
					</Link>
					<Link to="server" className={styles.menuItem}>
						<Text>Server Monitoring</Text>
					</Link>
					<Link
						to=""
						className={clsx(
							styles.menuItem,
							styles.menuItemDisabled,
						)}
					>
						<Text>Logging</Text>
					</Link>
				</Stack>

				<Stack gap="0">
					<Box mb="10" ml="12">
						<Text weight="bold">More stuff</Text>
					</Box>
					<Link to="alerts" className={styles.menuItem}>
						<Text>Add integrations & alerts</Text>
					</Link>
					<Link to="team" className={styles.menuItem}>
						<Text>Invite team</Text>
					</Link>
					<Link to="community" className={styles.menuItem}>
						<Text>Join community</Text>
					</Link>
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
						<Route
							path="server/:language?"
							element={
								<SetupOptionsList
									docs={docs}
									integrated={integrated}
								/>
							}
						/>
						<Route
							path=":language"
							element={
								<SetupOptionsList
									docs={docs}
									integrated={integrated}
								/>
							}
						/>
						<Route
							path="/server/:language/:framework"
							element={
								<SetupDocs
									docs={docs}
									integrated={integrated}
								/>
							}
						/>
						<Route
							path=":language/:framework"
							element={
								<SetupDocs
									docs={docs}
									integrated={integrated}
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
