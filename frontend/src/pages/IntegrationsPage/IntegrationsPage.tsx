import LoadingBox from '@components/LoadingBox'
import { Box, Stack, Text } from '@highlight-run/ui/components'
import {
	ProjectSelectionState,
	useIntegrationProjectSelection,
} from '@pages/IntegrationsPage/components/common/ProjectSelection'
import IntegrationDetailPanel from '@pages/IntegrationsPage/components/IntegrationDetailPanel'
import { Integration } from '@pages/IntegrationsPage/Integrations'
import { useWorkspaceIntegrations } from '@pages/IntegrationsPage/useWorkspaceIntegrations'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import {
	ParamsOverrideContext,
	useParams,
} from '@util/react-router/useParams'
import { Card } from 'antd'
import clsx from 'clsx'
import React, { useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'

import * as styles from '@/pages/SettingsRouter/SettingsRouter.css'

export interface IntegrationRouteScope {
	workspaceId?: string
	projectId?: string
}

export const resolveIntegrationBasePath = (
	scope: IntegrationRouteScope,
): string => {
	if (scope.workspaceId) {
		return `/w/${scope.workspaceId}/integrations`
	}
	if (scope.projectId) {
		return `/${scope.projectId}/integrations`
	}
	return '/integrations'
}

export const resolveDefaultIntegrationKey = (
	enabledIntegrations: Integration[],
	availableIntegrations: Integration[],
): string => {
	const candidates = [
		enabledIntegrations[0]?.key,
		availableIntegrations[0]?.key,
		'vercel',
	]
	return candidates.find(Boolean) || 'vercel'
}

const findActiveIntegration = (
	integrations: Integration[],
	targetKey: string,
): Integration | undefined => {
	return (
		integrations.find((item) => item.key === targetKey) || integrations[0]
	)
}

interface DefaultRedirectEvaluation {
	loading: boolean
	configureIntegration?: string
	defaultKey: string
}

const shouldRedirectToDefaultIntegration = (
	state: DefaultRedirectEvaluation,
): boolean => {
	const canRedirect = !state.loading && !state.configureIntegration
	return canRedirect && Boolean(state.defaultKey)
}

/**
 * Renders a categorized list of integration links in the left-hand sidebar.
 */
const IntegrationsSidebarGroup: React.FC<{
	title: string
	items: Integration[]
	basePath: string
}> = ({ title, items, basePath }) => (
	<Stack gap="0">
		<Box mt="12" mb="4" ml="8">
			<Text
				size="xxSmall"
				color="secondaryContentText"
				cssClass={styles.menuTitle}
			>
				{title}
			</Text>
		</Box>
		{items.map((tab) => (
			<NavLink
				key={tab.key}
				to={`${basePath}/${tab.key}`}
				className={({ isActive }) =>
					clsx(styles.menuItem, {
						[styles.menuItemActive]: isActive,
					})
				}
			>
				<Stack direction="row" align="center" gap="4">
					<img
						src={tab.icon}
						alt={tab.name}
						style={{
							borderRadius: tab.noRoundedIcon ? '0%' : '50%',
							height: '16px',
							width: '16px',
						}}
					/>
					<Text>{tab.name}</Text>
				</Stack>
			</NavLink>
		))}
	</Stack>
)

interface WorkspaceIntegrationsViewProps {
	projectSelection: ProjectSelectionState
	workspaceId?: string
	routeProjectId?: string
	configureIntegration?: string
}

/**
 * Renders the sidebar and selected integration detail panel once contextual
 * project parameters have been bound.
 */
const WorkspaceIntegrationsView: React.FC<{
	config: WorkspaceIntegrationsViewProps
}> = ({ config }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const [popUpModal] = useQueryParam('enable', StringParam)
	const {
		integrations,
		enabledIntegrations,
		availableIntegrations,
		loading,
	} = useWorkspaceIntegrations()

	const basePath = resolveIntegrationBasePath({
		workspaceId: config.workspaceId,
		projectId: config.routeProjectId,
	})

	const defaultKey = useMemo(
		() =>
			resolveDefaultIntegrationKey(
				enabledIntegrations,
				availableIntegrations,
			),
		[availableIntegrations, enabledIntegrations],
	)

	const targetKey = [config.configureIntegration, defaultKey].find(Boolean) || ''
	const activeIntegration = useMemo(
		() => findActiveIntegration(integrations, targetKey),
		[integrations, targetKey],
	)

	useEffect(() => {
		const needsRedirect = shouldRedirectToDefaultIntegration({
			loading,
			configureIntegration: config.configureIntegration,
			defaultKey,
		})
		if (needsRedirect) {
			navigate(`${basePath}/${defaultKey}${location.search}`, {
				replace: true,
			})
		}
	}, [
		basePath,
		config.configureIntegration,
		defaultKey,
		loading,
		location.search,
		navigate,
	])

	if (loading && !activeIntegration) {
		return (
			<Card>
				<LoadingBox height={156} />
			</Card>
		)
	}

	return (
		<Box
			display="flex"
			flexDirection="row"
			flexGrow={1}
			backgroundColor="raised"
			height="full"
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
				<IntegrationsSidebarGroup
					title="Enabled Integrations"
					items={enabledIntegrations}
					basePath={basePath}
				/>
				<IntegrationsSidebarGroup
					title="Available Integrations"
					items={availableIntegrations}
					basePath={basePath}
				/>
			</Box>
			{activeIntegration && (
				<Box
					flexGrow={1}
					display="flex"
					flexDirection="column"
					backgroundColor="white"
				>
					<IntegrationDetailPanel
						integration={activeIntegration}
						projectSelection={config.projectSelection}
						showModalDefault={popUpModal === activeIntegration.key}
						showSettingsDefault={
							config.configureIntegration ===
							activeIntegration.key
						}
					/>
				</Box>
			)}
		</Box>
	)
}

interface LegacyRedirectParams {
	routeWorkspaceId?: string
	routeProjectId?: string
	currentWorkspaceId?: string
	integrationKey?: string
	search: string
}

const resolveLegacyRedirectTarget = (
	params: LegacyRedirectParams,
): string | null => {
	const isLegacyRoute =
		!params.routeWorkspaceId &&
		Boolean(params.routeProjectId) &&
		Boolean(params.currentWorkspaceId)
	if (!isLegacyRoute) {
		return null
	}
	const suffix = params.integrationKey ? `/${params.integrationKey}` : ''
	return `/w/${params.currentWorkspaceId}/integrations${suffix}${params.search}`
}

const useResolvedIntegrationParams = () => {
	const {
		workspace_id: routeWorkspaceId,
		project_id: routeProjectId,
		integration_type: configureIntegration,
		'*': wildcardIntegration,
	} = useParams<{
		workspace_id?: string
		project_id?: string
		integration_type?: string
		'*'?: string
	}>()
	const wildcardKey = wildcardIntegration?.split('/').filter(Boolean)[0]
	const resolvedIntegrationKey = [configureIntegration, wildcardKey].find(
		Boolean,
	)

	return {
		routeWorkspaceId,
		routeProjectId,
		resolvedIntegrationKey,
	}
}

const IntegrationsPage = () => {
	const { routeWorkspaceId, routeProjectId, resolvedIntegrationKey } =
		useResolvedIntegrationParams()
	const { currentWorkspace } = useApplicationContext()
	const location = useLocation()
	const navigate = useNavigate()
	const projectSelection = useIntegrationProjectSelection()

	const resolvedWorkspaceId = [routeWorkspaceId, currentWorkspace?.id].find(
		Boolean,
	)

	useEffect(() => analytics.page('Integrations'), [])

	useEffect(() => {
		const redirectTarget = resolveLegacyRedirectTarget({
			routeWorkspaceId,
			routeProjectId,
			currentWorkspaceId: currentWorkspace?.id,
			integrationKey: resolvedIntegrationKey,
			search: location.search,
		})
		if (redirectTarget) {
			navigate(redirectTarget, { replace: true })
		}
	}, [
		currentWorkspace?.id,
		location.search,
		navigate,
		resolvedIntegrationKey,
		routeProjectId,
		routeWorkspaceId,
	])

	const overrideValue = useMemo(
		() => ({
			project_id:
				[projectSelection.selectedProjectId, routeProjectId].find(
					Boolean,
				) || '',
		}),
		[projectSelection.selectedProjectId, routeProjectId],
	)

	return (
		<>
			<Helmet>
				<title>Integrations</title>
			</Helmet>
			<ParamsOverrideContext.Provider value={overrideValue}>
				<WorkspaceIntegrationsView
					config={{
						projectSelection,
						workspaceId: resolvedWorkspaceId,
						routeProjectId,
						configureIntegration: resolvedIntegrationKey,
					}}
				/>
			</ParamsOverrideContext.Provider>
		</>
	)
}

export default IntegrationsPage
