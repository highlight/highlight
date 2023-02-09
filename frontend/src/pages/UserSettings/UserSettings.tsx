import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import Tabs from '@components/Tabs/Tabs'
import { EmailOptOutPanel } from '@pages/EmailOptOut/EmailOptOut'
import { auth } from '@util/auth'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Route, useNavigate } from 'react-router-dom'

import commonStyles from '../../Common.module.scss'
import projectSettingsStyles from '../ProjectSettings/ProjectSettings.module.scss'
import Auth from './Auth/Auth'

const UserSettings: React.FC = () => {
	const navigate = useNavigate()
	const params = useParams()

	const tabs = [
		...(auth.googleProvider
			? [
					{
						key: 'auth',
						title: 'Authentication',
						panelContent: (
							<>
								<Auth />
							</>
						),
					},
			  ]
			: []),
		...[
			{
				key: 'email-settings',
				title: 'Email Settings',
				panelContent: (
					<FieldsBox>
						<EmailOptOutPanel />
					</FieldsBox>
				),
			},
		],
	]

	return (
		<>
			<Helmet>
				<title>User Settings</title>
			</Helmet>

			<div className={commonStyles.bodyWrapper}>
				<div>
					<LeadAlignLayout>
						<div>
							<h2>User Settings</h2>
						</div>
						<Route
							path="/:tab?"
							element={
								<div
									className={
										projectSettingsStyles.tabsContainer
									}
								>
									<Tabs
										activeKeyOverride={
											params.tab || 'recording'
										}
										onChange={(key) => {
											navigate(
												`${location.pathname}/${key}`,
											)
										}}
										noHeaderPadding
										noPadding
										id="settingsTabs"
										tabs={tabs}
									/>
								</div>
							}
						/>
					</LeadAlignLayout>
				</div>
			</div>
		</>
	)
}

export default UserSettings
