import { Menu } from '@highlight-run/ui/components'
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

	return (
		<Menu placement="bottom-end">
			<Menu.Button
				emphasis="low"
				kind="secondary"
				cssClass={styles.accountIconWrapper}
			>
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
			</Menu.Button>
			<Menu.List>
				{!admin ? (
					<Menu.Item>
						<span>Loading...</span>
					</Menu.Item>
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
							<Menu.Item>
								<Link
									className={styles.dropdownMyAccount}
									to={`/w/${workspaceId}/account`}
								>
									My Account
								</Link>
							</Menu.Item>
						)}
						<Menu.Item
							onClick={async () => {
								try {
									signOut()
								} catch (e) {
									console.log(e)
								}
							}}
						>
							<div className={styles.dropdownLogout}>
								<span className={styles.dropdownLogoutText}>
									Logout
								</span>
								<FiLogOut className={styles.logoutIcon} />
							</div>
						</Menu.Item>
					</>
				)}
			</Menu.List>
		</Menu>
	)
}
