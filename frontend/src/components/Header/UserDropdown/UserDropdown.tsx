import { Box, Menu, Stack, Text } from '@highlight-run/ui/components'
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

	if (!admin) {
		return <Box p="8">loading</Box>
	}

	return (
		<Menu>
			<Menu.Button
				style={{
					padding: 0,
					height: 'auto',
					background: 'transparent',
					border: 'none',
				}}
			>
				<div className={styles.accountIconWrapper}>
					<AdminAvatar
						adminInfo={{
							name: admin?.name,
							email: admin?.email,
							photo_url: admin?.photo_url ?? '',
						}}
						size={35}
						border={border}
					/>
				</div>
			</Menu.Button>
			<Menu.List>
				<Box p="12">
					<Stack direction="row" gap="12" align="center">
						<AdminAvatar
							adminInfo={{
								name: admin?.name,
								email: admin?.email,
								photo_url: admin?.photo_url ?? '',
							}}
							size={40}
						/>
						<Stack gap="0">
							<Text weight="bold" color="default">
								{admin?.name}
							</Text>
							<Text size="small" color="weak">
								{admin?.email}
							</Text>
						</Stack>
					</Stack>
				</Box>
				<Menu.Divider />
				{workspaceId && (
					<Link
						style={{ textDecoration: 'none' }}
						to={`/w/${workspaceId}/account`}
					>
						<Menu.Item>My Account</Menu.Item>
					</Link>
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
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						width="full"
					>
						Logout
						<FiLogOut />
					</Box>
				</Menu.Item>
			</Menu.List>
		</Menu>
	)
}
