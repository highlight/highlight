import React from 'react'
import { Box } from '../components'
import { themeClass } from '../css/theme.css'

export const StoryWrapper: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	return (
		<Box cssClass={themeClass} p="24">
			{children}
		</Box>
	)
}
