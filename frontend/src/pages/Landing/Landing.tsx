import { useAuthContext } from '@authentication/AuthContext'
import { UserDropdown } from '@components/Header/UserDropdown/UserDropdown'
import { ReactNode, useEffect } from 'react'

export const Landing = ({ children }: { children: ReactNode }) => {
	const { isLoggedIn } = useAuthContext()

	useEffect(() => {
		window.Intercom('update', {
			hide_default_launcher: false,
		})
	}, [])

	return (
		<div
			className="bg-midnight flex min-h-screen w-full flex-col items-center overflow-y-auto p-8"
			style={{ transform: `translateZ(0)` }} // scroll optimization
		>
			<div className="fixed right-5 top-5">
				{isLoggedIn && <UserDropdown border />}
			</div>
			<div className="m-auto">{children}</div>
		</div>
	)
}
