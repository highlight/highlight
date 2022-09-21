import React from 'react'
import { Button } from '@frontapp/ui-kit'
import { useHighlightContext } from '../providers/highlightContext'

const OAuth = () => {
	const { loading, admin, logout, externalAuth } = useHighlightContext()
	return (
		<div style={{ padding: 12 }}>
			{loading ? 'loading...' : null}
			{JSON.stringify(admin)}
			{admin ? (
				<Button
					onClick={() => {
						logout!()
					}}
				>
					Logout
				</Button>
			) : (
				<Button
					onClick={() => {
						externalAuth!()
					}}
				>
					Login
				</Button>
			)}
		</div>
	)
}

export default OAuth
