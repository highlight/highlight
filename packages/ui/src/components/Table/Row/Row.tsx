import React from 'react'
import { Box } from '../../Box/Box'

type Props = {
	children: React.ReactNode
}

export const Row: React.FC<Props> = ({ children }) => {
	return (
		<Box
			borderBottom="dividerWeak"
			display="flex"
			flexDirection="row"
			gap="24"
		>
			{children}
		</Box>
	)
}
