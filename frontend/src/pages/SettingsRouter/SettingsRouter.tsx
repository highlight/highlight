import { Box, Stack, Text } from '@highlight-run/ui'
import WorkspaceSettings from '@pages/WorkspaceSettings/WorkspaceSettings'
import WorkspaceTeam from '@pages/WorkspaceTeam/WorkspaceTeam'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import React, { Suspense, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import {
	NavLink,
	Route,
	Routes,
	useLocation,
	useMatch,
	useNavigate,
} from 'react-router-dom'

import { EmailOptOutPanel } from '@/pages/EmailOptOut/EmailOptOut'
import Auth from '@/pages/UserSettings/Auth/Auth'
import { PlayerForm } from '@/pages/UserSettings/PlayerForm/PlayerForm'
import { auth } from '@/util/auth'

import * as styles from './SettingsRouter.css'

const BillingPage = React.lazy(() => import('../Billing/Billing'))

export type SettingGroups = 'account' | 'project'

export type WorkspaceSettingsTab =
	| 'team'
	| 'settings'
	| 'current-plan'
	| 'upgrade-plan'
	| SettingGroups

const getTitle = (tab: WorkspaceSettingsTab | string): string => {
	switch (tab) {
		case 'team':
			return 'User management'
		case 'settings':
			return 'Properties'
		case 'current-plan':
			return 'Current plan'
		case 'upgrade-plan':
			return 'Upgrade plan'
		default:
			return ''
	}
}

export const SettingsRouter = () => {
	const location = useLocation()
	const navigate = useNavigate()
	const { workspace_id: workspaceId, '*': sectionId } = useParams<{
		workspace_id: string
		'*': string
	}>()

	// Using useMatch instead of pulling from useParams because :page_id isn't
	// defined in a route anywhere, it's only used by the tabs.
	const workspaceMatch = useMatch('/w/:workspace_id/:section_id/:page_id?')
	const pageId =
		workspaceMatch?.params.page_id || (sectionId as WorkspaceSettingsTab)

	const workspaceSettingTabs = [
		{
			key: 'team',
			title: getTitle('team'),
			panelContent: <WorkspaceTeam />,
		},
		{
			key: 'settings',
			title: getTitle('settings'),
			panelContent: <WorkspaceSettings />,
		},
		{
			key: 'current-plan',
			title: getTitle('current-plan'),
			panelContent: (
				<Suspense fallback={null}>
					<BillingPage />
				</Suspense>
			),
		},
		{
			key: 'upgrade-plan',
			title: getTitle('upgrade-plan'),
			panelContent: (
				<Suspense fallback={null}>
					<BillingPage />
				</Suspense>
			),
		},
	]

	const accountSettingTabs = [
		...(auth.googleProvider
			? [
					{
						key: 'auth',
						title: 'Authentication',
						panelContent: <Auth />,
					},
			  ]
			: []),
		...[
			{
				key: 'email-settings',
				title: 'Email Settings',
				panelContent: <EmailOptOutPanel />,
			},
			{
				key: 'player-settings',
				title: 'Player Settings',
				panelContent: <PlayerForm />,
			},
		],
	]

	useEffect(() => {
		analytics.page()
		if (!pageId) {
			navigate(`/w/${workspaceId}/team`, { replace: true })
		}
	}, [location.pathname, navigate, pageId, workspaceId])

	return (
		<>
			<Helmet key={pageId}>
				<title>Workspace {getTitle(pageId)}</title>
			</Helmet>
			<Box
				display="flex"
				flexDirection="row"
				flexGrow={1}
				backgroundColor="raised"
			>
				<Stack p="8">
					<Stack gap="0">
						<Box mt="12" mb="10" ml="8">
							<Text size="xxSmall" color="secondaryContentText">
								Workspace Settings
							</Text>
						</Box>
						{workspaceSettingTabs.map((tab) => (
							<NavLink
								key={tab.key}
								to={`${tab.key}`}
								className={({ isActive }) =>
									clsx(styles.menuItem, {
										[styles.menuItemActive]: isActive,
									})
								}
							>
								<Stack direction="row" align="center" gap="4">
									<Text>{tab.title}</Text>
								</Stack>
							</NavLink>
						))}
					</Stack>
					<Stack gap="0">
						<Box mt="12" mb="10" ml="8">
							<Text size="xxSmall" color="secondaryContentText">
								Account Settings
							</Text>
						</Box>
						{accountSettingTabs.map((tab) => (
							<NavLink
								key={tab.key}
								to={`account/${tab.key}`}
								className={({ isActive }) =>
									clsx(styles.menuItem, {
										[styles.menuItemActive]: isActive,
									})
								}
							>
								<Stack direction="row" align="center" gap="4">
									<Text>{tab.title}</Text>
								</Stack>
							</NavLink>
						))}
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
						<Box overflowY="scroll" height="full">
							<Routes>
								{workspaceSettingTabs.map((tab) => (
									<Route
										key={tab.key}
										path={`${tab.key}`}
										element={tab.panelContent}
									/>
								))}
								{accountSettingTabs.map((tab) => (
									<Route
										key={tab.key}
										path={`account/${tab.key}`}
										element={
											<Box>
												<Box
													style={{ maxWidth: 560 }}
													my="40"
													mx="auto"
												>
													{tab.panelContent}
												</Box>
											</Box>
										}
									/>
								))}
							</Routes>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}
