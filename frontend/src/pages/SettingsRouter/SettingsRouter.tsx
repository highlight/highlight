import { ProductType } from '@graph/schemas'
import { Box, Stack, Text } from '@highlight-run/ui/components'
import { ProjectProductFilters } from '@pages/ProjectSettings/ProjectFilters/ProjectFilters'
import WorkspaceSettings from '@pages/WorkspaceSettings/WorkspaceSettings'
import WorkspaceTeam from '@pages/WorkspaceTeam/WorkspaceTeam'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import React, { Suspense, useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import {
	NavLink,
	Route,
	Routes,
	useLocation,
	useMatch,
	useNavigate,
} from 'react-router-dom'

import { WorkspaceSettingsTab } from '@/hooks/useIsSettingsPath'
import { EmailOptOutPanel } from '@/pages/EmailOptOut/EmailOptOut'
import { HaroldAISettings } from '@/pages/HaroldAISettings/HaroldAISettings'
import { ProjectColorLabel } from '@/pages/ProjectSettings/ProjectColorLabel/ProjectColorLabel'
import ProjectSettings from '@/pages/ProjectSettings/ProjectSettings'
import Auth from '@/pages/UserSettings/Auth/Auth'
import { PlayerForm } from '@/pages/UserSettings/PlayerForm/PlayerForm'
import { useGlobalContext } from '@/routers/ProjectRouter/context/GlobalContext'
import { auth } from '@/util/auth'

import * as styles from './SettingsRouter.css'

const BillingPageV2 = React.lazy(() => import('../Billing/BillingPageV2'))
const PlanComparisonPage = React.lazy(
	() => import('../Billing/PlanComparisonPage'),
)

const getTitle = (tab: WorkspaceSettingsTab | string): string => {
	switch (tab) {
		case 'team':
			return 'Members'
		case 'settings':
			return 'Properties'
		case 'current-plan':
			return 'Billing plans'
		case 'upgrade-plan':
			return 'Upgrade plan'
		case 'harold-ai':
			return 'Harold AI'
		case 'plan-features':
			return 'Plan comparison'
		default:
			return ''
	}
}

export const SettingsRouter = () => {
	const location = useLocation()
	const navigate = useNavigate()
	const {
		workspace_id,
		project_id,
		'*': sectionId,
	} = useParams<{
		workspace_id: string
		project_id: string
		'*': string
	}>()
	const { allProjects, currentProject, currentWorkspace } =
		useApplicationContext()
	const { toggleShowBanner } = useGlobalContext()
	const workspaceId = workspace_id || currentWorkspace?.id
	const projectId = project_id || currentProject?.id
	// Using useMatch instead of pulling from useParams because :page_id isn't
	// defined in a route anywhere, it's only used by the tabs.
	const workspaceMatch = useMatch('/w/:workspace_id/:section_id/:page_id?')
	const projectMatch = useMatch('/:project_id/settings/:page_id?')
	const productFilterMatch = useMatch(
		'/:project_id/settings/filters/:product',
	)
	const pageId =
		workspaceMatch?.params.page_id ||
		projectMatch?.params.page_id ||
		sectionId ||
		''

	toggleShowBanner(false)

	const billingContent = (
		<Suspense fallback={null}>
			{isOnPrem ? (
				<PlanComparisonPage
					setSelectedPlanType={() => {}}
					setStep={() => {}}
				/>
			) : (
				<BillingPageV2 />
			)}
		</Suspense>
	)

	const workspaceSettingTabs = [
		{
			key: 'team',
			pathParam: '/:member_tab_key?',
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
			panelContent: billingContent,
		},
		{
			key: 'harold-ai',
			title: getTitle('harold-ai'),
			panelContent: <HaroldAISettings />,
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
				title: 'Notifications',
				panelContent: <EmailOptOutPanel />,
			},
			{
				key: 'player-settings',
				title: 'App settings',
				panelContent: <PlayerForm />,
			},
		],
	]

	const projectSettingTabs = useMemo(
		() =>
			allProjects
				? allProjects.map((project) => ({
						key: project?.id,
						title: project?.name,
				  }))
				: [],
		[allProjects],
	)

	useEffect(() => {
		analytics.page('Settings', {
			page: pageId,
		})

		if (!pageId) {
			navigate(`/w/${workspaceId}/team`, { replace: true })
		}
	}, [location.pathname, navigate, pageId, workspaceId])

	return (
		<>
			<Helmet key={pageId}>
				<title>{getTitle(pageId)} Settings</title>
			</Helmet>
			<Box
				display="flex"
				flexDirection="row"
				flexGrow={1}
				backgroundColor="raised"
			>
				<Box
					p="8"
					gap="12"
					display="flex"
					flexDirection="column"
					borderRight="secondary"
					position="relative"
					cssClass={styles.sidebarScroll}
				>
					<Stack gap="0">
						<Box mt="12" mb="4" ml="8">
							<Text
								size="xxSmall"
								color="secondaryContentText"
								cssClass={styles.menuTitle}
							>
								Account Settings
							</Text>
						</Box>
						{accountSettingTabs.map((tab) => (
							<NavLink
								key={tab.key}
								to={`/w/${workspaceId}/account/${tab.key}`}
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
						<Box mt="12" mb="4" ml="8">
							<Text
								size="xxSmall"
								color="secondaryContentText"
								cssClass={styles.menuTitle}
							>
								Workspace Settings
							</Text>
						</Box>
						{workspaceSettingTabs.map((tab) => (
							<NavLink
								key={tab.key}
								to={`/w/${workspaceId}/${tab.key}`}
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
						<Box mt="12" mb="4" ml="8">
							<Text
								size="xxSmall"
								color="secondaryContentText"
								cssClass={styles.menuTitle}
							>
								Project Settings
							</Text>
						</Box>
						{projectSettingTabs.map((project) => (
							<NavLink
								key={project.key}
								to={`/${project.key}/settings/general`}
								className={clsx(styles.menuItem, {
									[styles.menuItemActive]:
										projectId === project.key,
								})}
							>
								<Stack direction="row" align="center" gap="4">
									<ProjectColorLabel
										seed={project.title || ''}
										size={8}
									/>
									<Text>{project.title}</Text>
								</Stack>
							</NavLink>
						))}
					</Stack>
				</Box>
				<Box flexGrow={1} display="flex" flexDirection="column">
					<Box
						m="8"
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
								{workspaceSettingTabs.map((tab) => {
									const path = tab.pathParam
										? `${tab.key}${tab.pathParam}`
										: tab.key
									return (
										<Route
											key={tab.key}
											path={path}
											element={tab.panelContent}
										/>
									)
								})}
								<Route
									path="current-plan/success"
									element={billingContent}
								/>
								<Route
									path="upgrade-plan"
									element={billingContent}
								/>
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
								<Route
									path=":tab?"
									element={<ProjectSettings />}
								/>
								<Route
									path="filters/:product"
									element={
										<Box
											style={{ maxWidth: 560 }}
											my="40"
											mx="auto"
										>
											{productFilterMatch?.params
												.product && (
												<ProjectProductFilters
													product={
														(productFilterMatch?.params.product
															?.charAt(0)
															.toUpperCase() +
															productFilterMatch?.params.product
																?.slice(1)
																.toLowerCase()) as ProductType
													}
												/>
											)}
										</Box>
									}
								/>
							</Routes>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}
