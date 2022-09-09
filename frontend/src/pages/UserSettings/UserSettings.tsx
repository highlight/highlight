import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import React from 'react'
import { Helmet } from 'react-helmet'

import Auth from './Auth/Auth'
import styles from './UserSettings.module.scss'

const UserSettings: React.FC = () => {
	return (
		<>
			<Helmet>
				<title>User Settings</title>
			</Helmet>
			<LeadAlignLayout>
				<div>
					<h2 className={styles.header}>User Settings</h2>
				</div>

				<Auth />
			</LeadAlignLayout>
		</>
	)
}

export default UserSettings
