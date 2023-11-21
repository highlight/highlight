import { useAuthContext } from '@authentication/AuthContext'
import { UserDropdown } from '@components/Header/UserDropdown/UserDropdown'
import { Box } from '@highlight-run/ui'
import { ReactNode } from 'react'

export const Landing = ({ children }: { children: ReactNode }) => {
	const { isLoggedIn } = useAuthContext()

	return (
		<Box
			backgroundColor="p12"
			alignItems="center"
			display="flex"
			minHeight="screen"
			minWidth="screen"
			overflowY="scroll"
			p="32"
		>
			<Box cssClass="fixed right-5 top-5">
				{isLoggedIn && <UserDropdown border />}
			</Box>
			<Box m="auto">{children}</Box>
		</Box>
	)
}
