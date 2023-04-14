import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import Tabs from '@components/Tabs/Tabs'
import { EmailOptOutPanel } from '@pages/EmailOptOut/EmailOptOut'
import { PlayerForm } from '@pages/UserSettings/PlayerForm/PlayerForm'
import { auth } from '@util/auth'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'

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
						panelContent: <Auth />,
					},
			  ]
			: []),
		...[
			{
				key: 'email-settings',
				title: 'Email Settings',
				panelContent: (
					<FieldsBox id="email-settings">
						<EmailOptOutPanel />
					</FieldsBox>
				),
			},
			{
				key: 'player-settings',
				title: 'Player Settings',
				panelContent: (
					<FieldsBox id="player-settings">
						<PlayerForm />
					</FieldsBox>
				),
			},
		],
	]

	const activeKey = params.tab ?? tabs[0].key
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
						<div className={projectSettingsStyles.tabsContainer}>
							<Tabs
								activeKeyOverride={activeKey}
								onChange={(key) => {
									navigate(
										`${location.pathname.replace(
											'/' + activeKey,
											'',
										)}/${key}`,
									)
								}}
								noHeaderPadding
								noPadding
								id="settingsTabs"
								tabs={tabs}
							/>
						</div>
					</LeadAlignLayout>
				</div>
			</div>
		</>
	)
}

export default UserSettings
