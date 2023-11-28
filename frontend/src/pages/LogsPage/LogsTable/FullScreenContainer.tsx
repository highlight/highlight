import { Box } from '@highlight-run/ui/components'
import React from 'react'

type Props = {}

export const FullScreenContainer: React.FC<React.PropsWithChildren<Props>> = ({
	children,
}) => {
	return (
		<Box
			display="flex"
			flexGrow={1}
			alignItems="center"
			justifyContent="center"
			height="full"
		>
			{children}
		</Box>
	)
}
