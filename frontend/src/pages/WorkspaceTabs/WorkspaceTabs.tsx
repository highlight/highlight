import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import Tabs from '@components/Tabs/Tabs'
import WorkspaceSettings from '@pages/WorkspaceSettings/WorkspaceSettings'
import WorkspaceTeam from '@pages/WorkspaceTeam/WorkspaceTeam'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import React, { Suspense, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useLocation, useMatch, useNavigate } from 'react-router-dom'

import styles from './WorkspaceTabs.module.scss'

const BillingPage = React.lazy(() => import('../Billing/Billing'))
const BillingPageV2 = React.lazy(() => import('../Billing/BillingPageV2'))

export type WorkspaceSettingsTab =
	| 'team'
	| 'settings'
	| 'current-plan'
	| 'upgrade-plan'

const getTitle = (tab: WorkspaceSettingsTab): string => {
	switch (tab) {
		case 'team':
			return 'Team'
		case 'settings':
			return 'Properties'
		case 'current-plan':
			return 'Current Plan'
		case 'upgrade-plan':
			return 'Upgrade Plan'
		default:
			return ''
	}
}

export const WorkspaceTabs = () => {
	const location = useLocation()
	const navigate = useNavigate()
	const { workspace_id: workspaceId } = useParams<{ workspace_id: string }>()

	// Using useMatch instead of pulling from useParams because :page_id isn't
	// defined in a route anywhere, it's only used by the tabs.
	const workspaceMatch = useMatch('/w/:workspace_id/:page_id')
	const pageId = workspaceMatch?.params.page_id as WorkspaceSettingsTab

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
			<LeadAlignLayout fullWidth>
				<div>
					<h2 className={styles.header}>Workspace Settings</h2>
				</div>
				<Tabs
					className={styles.workspaceTabs}
					noPadding
					noHeaderPadding
					activeKeyOverride={pageId}
					onChange={(activeKey) =>
						navigate(`/w/${workspaceId}/${activeKey}`)
					}
					tabs={[
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
									<BillingPageV2 />
								</Suspense>
							),
						},
						{
							key: 'upgrade-plan',
							title: getTitle('upgrade-plan'),
							panelContent: (
								<Suspense fallback={null}>
									<BillingPageV2 />
								</Suspense>
							),
						},
					]}
					id="WorkspaceSettings"
				/>
			</LeadAlignLayout>
		</>
	)
}
