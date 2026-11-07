import { ProductType } from '@graph/schemas'
import { Box, Stack, Text } from '@highlight-run/ui/components'
import IntegrationsPage from '@pages/IntegrationsPage/IntegrationsPage'
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

import { useAuthContext } from '@/authentication/AuthContext'
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

const TITLE_BY_TAB: Record<string, string> = {
	team: 'Members',
	settings: 'Properties',
	'current-plan': 'Billing plans',
	'upgrade-plan': 'Upgrade plan',
	'harold-ai': 'Harold AI',
	integrations: 'Integrations',
	'plan-features': 'Plan comparison',
}

const getTitle = (tab: WorkspaceSettingsTab | string): string => {
	return TITLE_BY_TAB[tab] || ''
}

interface SettingTabItem {
	key: string
	title: string
	pathParam?: string
	panelContent: React.ReactNode
}

interface ProjectTabItem {
	key?: string
	title?: string
}

interface SettingsSidebarProps {
	workspaceId?: string
	projectId?: string
	isProjectLevelMember: boolean
	accountSettingTabs: SettingTabItem[]
	workspaceSettingTabs: SettingTabItem[]
	projectSettingTabs: ProjectTabItem[]
}

const formatProductFilterName = (rawProduct?: string): ProductType => {
	if (!rawProduct) {
		return '' as ProductType
	}
	return (rawProduct.charAt(0).toUpperCase() +
		rawProduct.slice(1).toLowerCase()) as ProductType
}

/**
 * Renders a single vertical section of navigation links in the settings sidebar.
 */
const SidebarMenuSection: React.FC<{
	heading: string
	children: React.ReactNode
}> = ({ heading, children }) => (
	<Stack gap="0">
		<Box mt="12" mb="4" ml="8">
			<Text
				size="xxSmall"
				color="secondaryContentText"
				cssClass={styles.menuTitle}
			>
				{heading}
			</Text>
		</Box>
		{children}
	</Stack>
)

/**
 * Renders the left-hand navigation rail for Account, Workspace, and Project settings.
 */
const SettingsSidebar: React.FC<{ config: SettingsSidebarProps }> = ({
	config,
}) => (
	<Box
		p="8"
		gap="12"
		display="flex"
		flexDirection="column"
		borderRight="secondary"
		position="relative"
		cssClass={styles.sidebarScroll}
	>
		<SidebarMenuSection heading="Account Settings">
			{config.accountSettingTabs.map((tab) => (
				<NavLink
					key={tab.key}
					to={`/w/${config.workspaceId}/account/${tab.key}`}
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
		</SidebarMenuSection>
		{!config.isProjectLevelMember && (
			<SidebarMenuSection heading="Workspace Settings">
				{config.workspaceSettingTabs.map((tab) => (
					<NavLink
						key={tab.key}
						to={`/w/${config.workspaceId}/${tab.key}`}
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
			</SidebarMenuSection>
		)}
		<SidebarMenuSection heading="Project Settings">
			{config.projectSettingTabs.map((project) => (
				<NavLink
					key={project.key}
					to={`/${project.key}/settings/general`}
					className={clsx(styles.menuItem, {
						[styles.menuItemActive]:
							config.projectId === project.key,
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
		</SidebarMenuSection>
	</Box>
)

interface SettingsRoutesPanelProps {
	workspaceSettingTabs: SettingTabItem[]
	accountSettingTabs: SettingTabItem[]
	billingContent: React.ReactNode
	productFilterParam?: string
}

const resolveRoutePath = (tab: SettingTabItem): string => {
	return tab.pathParam ? `${tab.key}${tab.pathParam}` : tab.key
}

/**
 * Renders the matched settings panel inside the elevated scroll container.
 */
const SettingsRoutesPanel: React.FC<{ config: SettingsRoutesPanelProps }> = ({
	config,
}) => (
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
					{config.workspaceSettingTabs.map((tab) => (
						<Route
							key={tab.key}
							path={resolveRoutePath(tab)}
							element={tab.panelContent}
						/>
					))}
					<Route
						path="current-plan/success"
						element={config.billingContent}
					/>
					<Route
						path="upgrade-plan"
						element={config.billingContent}
					/>
					{config.accountSettingTabs.map((tab) => (
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
					<Route path=":tab?" element={<ProjectSettings />} />
					<Route
						path="filters/:product"
						element={
							<Box style={{ maxWidth: 560 }} my="40" mx="auto">
								{config.productFilterParam && (
									<ProjectProductFilters
										product={formatProductFilterName(
											config.productFilterParam,
										)}
									/>
								)}
							</Box>
						}
					/>
				</Routes>
			</Box>
		</Box>
	</Box>
)

const buildWorkspaceSettingTabs = (
	billingContent: React.ReactNode,
): SettingTabItem[] => [
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
	{
		key: 'integrations',
		pathParam: '/:integration_type?',
		title: getTitle('integrations'),
		panelContent: <IntegrationsPage />,
	},
]

const buildAccountSettingTabs = (): SettingTabItem[] => {
	const baseTabs: SettingTabItem[] = [
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
	]
	if (!auth.googleProvider) {
		return baseTabs
	}
	return [
		{
			key: 'auth',
			title: 'Authentication',
			panelContent: <Auth />,
		},
		...baseTabs,
	]
}

const renderBillingContent = (): React.ReactNode => (
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

const useMatchedSettingsPageId = (sectionId?: string): string => {
	// Using useMatch instead of pulling from useParams because :page_id isn't
	// defined in a route anywhere, it's only used by the tabs.
	const workspaceMatch = useMatch('/w/:workspace_id/:section_id/:page_id?')
	const projectMatch = useMatch('/:project_id/settings/:page_id?')
	const candidates = [
		workspaceMatch?.params.page_id,
		projectMatch?.params.page_id,
		sectionId,
	]
	return candidates.find(Boolean) || ''
}

/**
 * Resolves workspace, project, and active tab route parameters for SettingsRouter.
 */
const useSettingsRouteParams = () => {
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
	const productFilterMatch = useMatch(
		'/:project_id/settings/filters/:product',
	)
	const pageId = useMatchedSettingsPageId(sectionId)

	return {
		allProjects,
		workspaceId: [workspace_id, currentWorkspace?.id].find(Boolean),
		projectId: [project_id, currentProject?.id].find(Boolean),
		pageId,
		productFilterParam: productFilterMatch?.params.product,
	}
}

export const SettingsRouter = () => {
	const location = useLocation()
	const navigate = useNavigate()
	const {
		allProjects,
		workspaceId,
		projectId,
		pageId,
		productFilterParam,
	} = useSettingsRouteParams()
	const { toggleShowBanner } = useGlobalContext()
	const { isProjectLevelMember } = useAuthContext()

	toggleShowBanner(false)

	const billingContent = renderBillingContent()
	const workspaceSettingTabs = buildWorkspaceSettingTabs(billingContent)
	const accountSettingTabs = buildAccountSettingTabs()

	const projectSettingTabs = useMemo(
		() =>
			(allProjects || []).map((project) => ({
				key: project?.id,
				title: project?.name,
			})),
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
				<SettingsSidebar
					config={{
						workspaceId,
						projectId,
						isProjectLevelMember: Boolean(isProjectLevelMember),
						accountSettingTabs,
						workspaceSettingTabs,
						projectSettingTabs,
					}}
				/>
				<SettingsRoutesPanel
					config={{
						workspaceSettingTabs,
						accountSettingTabs,
						billingContent,
						productFilterParam,
					}}
				/>
			</Box>
		</>
	)
}
