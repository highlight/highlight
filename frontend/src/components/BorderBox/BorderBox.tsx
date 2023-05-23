import { Box } from '@highlight-run/ui'
import React from 'react'

const BorderBox: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<Box border="dividerWeak" borderRadius="8" p="8">
			{children}
		</Box>
	)
}

export default BorderBox
