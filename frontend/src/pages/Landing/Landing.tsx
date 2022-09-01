import { useAuthContext } from '@authentication/AuthContext'
import { UserDropdown } from '@components/Header/UserDropdown/UserDropdown'
import React, { useEffect } from 'react'

import styles from './Landing.module.scss'

export const Landing: React.FC<{}> = ({ children }) => {
	const { isLoggedIn } = useAuthContext()

	useEffect(() => {
		window.Intercom('update', {
			hide_default_launcher: false,
		})
	}, [])

	return (
		<div className={styles.contentWrapper}>
			<div className={styles.userDropdownContainer}>
				{isLoggedIn && <UserDropdown border />}
			</div>
			{children}
		</div>
	)
}
