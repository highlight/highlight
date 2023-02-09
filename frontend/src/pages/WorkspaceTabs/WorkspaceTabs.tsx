import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import Tabs from '@components/Tabs/Tabs'
import WorkspaceSettings from '@pages/WorkspaceSettings/WorkspaceSettings'
import WorkspaceTeam from '@pages/WorkspaceTeam/WorkspaceTeam'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import React, { Suspense, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useLocation, useNavigate } from 'react-router-dom'

import styles from './WorkspaceTabs.module.scss'

const BillingPage = React.lazy(() => import('../Billing/Billing'))

type SettingsTab = 'team' | 'settings' | 'current-plan' | 'upgrade-plan'

const getTitle = (tab: SettingsTab): string => {
	switch (tab) {
		case 'team':
			return 'Team'
		case 'settings':
			return 'Properties'
		case 'current-plan':
			return 'Current Plan'
		case 'upgrade-plan':
			return 'Upgrade Plan'
	}
}

export const WorkspaceTabs = () => {
	const location = useLocation()
	const navigate = useNavigate()

	const { workspace_id, page_id } = useParams<{
		workspace_id: string
		page_id: SettingsTab
	}>()

	useEffect(() => analytics.page(), [location.pathname])

	return (
		<>
			<Helmet key={page_id}>
				<title>Workspace {getTitle(page_id ?? 'team')}</title>
			</Helmet>
			<LeadAlignLayout fullWidth>
				<div>
					<h2 className={styles.header}>Workspace Settings</h2>
				</div>
				<Tabs
					className={styles.workspaceTabs}
					noPadding
					noHeaderPadding
					activeKeyOverride={page_id}
					onChange={(activeKey) =>
						navigate(`/w/${workspace_id}/${activeKey}`)
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
					]}
					id="WorkspaceSettings"
				/>
			</LeadAlignLayout>
		</>
	)
}
