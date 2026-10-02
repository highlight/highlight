import { FiLogOut } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { useAuthContext } from '@/authentication/AuthContext'
import { Box, IconSolidLoading, Menu, Text } from '@highlight-run/ui/components'

import { AdminAvatar } from '../../Avatar/Avatar'
import styles from './UserDropdown.module.css'

interface Props {
	border?: boolean
	workspaceId?: string
}

export const UserDropdown = ({ border, workspaceId }: Props) => {
	const { admin, signOut } = useAuthContext()

	return (
		<Menu>
			<Menu.Button
				cssClass={styles.accountIconWrapper}
				kind="secondary"
				emphasis="low"
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
					<Text>loading</Text>
				)}
			</Menu.Button>
			<Menu.List cssClass={styles.dropdownMenu}>
				{!admin ? (
					<Box
						display="flex"
						alignItems="center"
						justifyContent="center"
						padding="12"
					>
						<IconSolidLoading size={16} />
					</Box>
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
								<Menu.Item>My Account</Menu.Item>
							</Link>
						)}
						<Menu.Divider />
						<Menu.Item
							onClick={async () => {
								try {
									signOut()
								} catch (e) {
									console.log(e)
								}
							}}
						>
							<Box
								display="flex"
								alignItems="center"
								justifyContent="space-between"
								width="full"
							>
								<Text color="bad">Logout</Text>
								<FiLogOut
									className={styles.logoutIcon}
									color="var(--color-red-400)"
								/>
							</Box>
						</Menu.Item>
					</>
				)}
			</Menu.List>
		</Menu>
	)
}
