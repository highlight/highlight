import { Dropdown, Skeleton } from 'antd'
import { FiLogOut } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { useAuthContext } from '@/authentication/AuthContext'

import { AdminAvatar } from '../../Avatar/Avatar'
import styles from './UserDropdown.module.css'

interface Props {
	border?: boolean
	workspaceId?: string
}

export const UserDropdown = ({ border, workspaceId }: Props) => {
	const { admin, signOut } = useAuthContext()

	const menu = (
		<div className={styles.dropdownMenu}>
			<div className={styles.dropdownInner}>
				{!admin ? (
					<Skeleton />
				) : (
					<>
						<div className={styles.userInfoWrapper}>
							<div className={styles.avatarWrapper}>
								<AdminAvatar
									adminInfo={{
										name: admin?.name,
										email: admin?.email,
										photo_url: admin?.photo_url ?? '',
									}}
									size={40}
								/>
							</div>
							<div className={styles.userCopy}>
								<h4 className={styles.dropdownName}>
									{admin?.name}
								</h4>
								<p className={styles.dropdownEmail}>
									{admin?.email}
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
									signOut()
								} catch (e) {
									console.log(e)
								}
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
				{admin ? (
					<AdminAvatar
						adminInfo={{
							name: admin?.name,
							email: admin?.email,
							photo_url: admin?.photo_url ?? '',
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
