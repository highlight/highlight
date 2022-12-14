import { useGetAdminQuery } from '@graph/hooks'
import { auth } from '@util/auth'
import { client } from '@util/graph'
import { Dropdown, Skeleton } from 'antd'
import React from 'react'
import { FiLogOut } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { AdminAvatar } from '../../Avatar/Avatar'
import styles from './UserDropdown.module.scss'

interface Props {
	border?: boolean
	workspaceId?: string
}

export const UserDropdown = ({ border, workspaceId }: Props) => {
	const {
		loading: a_loading,
		error: a_error,
		data: a_data,
	} = useGetAdminQuery()

	const menu = (
		<div className={styles.dropdownMenu}>
			<div className={styles.dropdownInner}>
				{a_loading || a_error ? (
					<Skeleton />
				) : (
					<>
						<div className={styles.userInfoWrapper}>
							<div className={styles.avatarWrapper}>
								<AdminAvatar
									adminInfo={{
										name: a_data?.admin?.name,
										email: a_data?.admin?.email,
										photo_url:
											a_data?.admin?.photo_url ?? '',
									}}
									size={40}
								/>
							</div>
							<div className={styles.userCopy}>
								<h4 className={styles.dropdownName}>
									{a_data?.admin?.name}
								</h4>
								<p className={styles.dropdownEmail}>
									{a_data?.admin?.email}
								</p>
							</div>
						</div>
						{workspaceId && (
							<Link
								className={styles.dropdownMyAccount}
								to={`/w/${workspaceId}/account`}
							>
								My Account
							</Link>
						)}
						<div
							className={styles.dropdownLogout}
							onClick={async () => {
								try {
									auth.signOut()
								} catch (e) {
									console.log(e)
								}
								await client.clearStore()
							}}
						>
							<span className={styles.dropdownLogoutText}>
								Logout
							</span>
							<FiLogOut className={styles.logoutIcon} />
						</div>
					</>
				)}
			</div>
		</div>
	)
	return (
		<Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
			<div className={styles.accountIconWrapper}>
				{a_data?.admin ? (
					<AdminAvatar
						adminInfo={{
							name: a_data?.admin?.name,
							email: a_data?.admin?.email,
							photo_url: a_data?.admin?.photo_url ?? '',
						}}
						size={35}
						border={border}
					/>
				) : (
					<p>loading</p>
				)}
			</div>
		</Dropdown>
	)
}
