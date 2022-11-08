import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import React from 'react'
import { Helmet } from 'react-helmet'

import commonStyles from '../../Common.module.scss'
import Auth from './Auth/Auth'

const UserSettings: React.FC = () => {
	return (
		<>
			<Helmet>
				<title>User Settings</title>
			</Helmet>

			<div className={commonStyles.bodyWrapper}>
				<div>
					<div>
						<h2>User Settings</h2>
					</div>

					<LeadAlignLayout>
						<Auth />
					</LeadAlignLayout>
				</div>
			</div>
		</>
	)
}

export default UserSettings
