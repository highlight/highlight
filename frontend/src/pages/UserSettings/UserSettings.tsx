import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import classNames from 'classnames'
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

			<div
				className={classNames(
					commonStyles.bodyWrapper,
					commonStyles.sidebarHidden,
				)}
			>
				<div>
					<div>
						<h2 className={styles.header}>User Settings</h2>
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
