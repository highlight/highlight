import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import Tabs from '@components/Tabs/Tabs'
import { EmailOptOutPanel } from '@pages/EmailOptOut/EmailOptOut'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Route, Switch, useRouteMatch } from 'react-router-dom'

import commonStyles from '../../Common.module.scss'
import projectSettingsStyles from '../ProjectSettings/ProjectSettings.module.scss'
import Auth from './Auth/Auth'

const UserSettings: React.FC = () => {
	const match = useRouteMatch()

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
							path={`${match.path}/:tab?`}
							render={({ history, match: tabsMatch }) => {
								return (
									<div
										className={
											projectSettingsStyles.tabsContainer
										}
									>
										<Switch>
											<Tabs
												activeKeyOverride={
													tabsMatch.params.tab ||
													'recording'
												}
												onChange={(key) => {
													history.push(
														`${match.url}/${key}`,
													)
												}}
												noHeaderPadding
												noPadding
												id="settingsTabs"
												tabs={[
													{
														key: 'auth',
														title: 'Authentication',
														panelContent: (
															<>
																<Auth />
															</>
														),
													},
													{
														key: 'email-settings',
														title: 'Email Settings',
														panelContent: (
															<FieldsBox>
																<EmailOptOutPanel />
															</FieldsBox>
														),
													},
												]}
											/>
										</Switch>
									</div>
								)
							}}
						/>
					</LeadAlignLayout>
				</div>
			</div>
		</>
	)
}

export default UserSettings
