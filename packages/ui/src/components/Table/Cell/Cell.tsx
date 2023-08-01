import React from 'react'
import { Box } from '../../Box/Box'

type Props = {
	children: React.ReactNode
}

export const Cell: React.FC<Props> = ({ children }) => {
	return <Box>{children}</Box>
}
