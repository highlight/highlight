import React from 'react'
import { Box } from '../components/Box/Box'

export const StoryWrapper: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	React.useEffect(() => {
		// Applying this via JS to the body so it applies to portals rendered
		// outside the main DOM tree.
		document.body.classList.add('highlight-light-theme')
	}, [])

	return <Box p="24">{children}</Box>
}
