import React from 'react'
import { Box } from '../../Box/Box'

export type Props = {
	children: React.ReactNode
}

export const Body: React.FC<Props> = ({ children }) => {
	return <Box>{children}</Box>
}
