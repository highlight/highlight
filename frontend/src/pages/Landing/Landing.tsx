import { useAuthContext } from '@authentication/AuthContext'
import { UserDropdown } from '@components/Header/UserDropdown/UserDropdown'
import { Box } from '@highlight-run/ui'
import { ReactNode, useEffect } from 'react'

export const Landing = ({ children }: { children: ReactNode }) => {
	const { isLoggedIn } = useAuthContext()

	useEffect(() => {
		window.Intercom('update', {
			hide_default_launcher: false,
		})
	}, [])

	return (
		<Box
			p="32"
			display="flex"
			minWidth="screen"
			minHeight="screen"
			overflowY="scroll"
			alignItems="center"
		>
			<Box cssClass="fixed right-5 top-5">
				{isLoggedIn && <UserDropdown border />}
			</Box>
			<Box m="auto">{children}</Box>
		</Box>
	)
}
