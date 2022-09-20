import React from 'react'
import { Button } from '@frontapp/ui-kit'
import { useHighlightContext } from '../providers/highlightContext'

const OAuth = () => {
	const { loading, admin, externalAuth } = useHighlightContext()
	return (
		<div style={{ padding: 12 }}>
			{loading ? 'loading...' : null}
			{JSON.stringify(admin)}
			<Button
				onClick={() => {
					externalAuth!()
				}}
			>
				Login
			</Button>
		</div>
	)
}

export default OAuth
