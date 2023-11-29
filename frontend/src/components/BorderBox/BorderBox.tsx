import { Box } from '@highlight-run/ui/components'
import React from 'react'

interface Props {
	noPadding?: boolean
}

const BorderBox: React.FC<React.PropsWithChildren<Props>> = ({
	children,
	noPadding,
}) => {
	const props = { px: '8', py: '12' } as const
	return (
		<Box
			border="dividerWeak"
			borderRadius="8"
			{...(noPadding ? {} : props)}
		>
			{children}
		</Box>
	)
}

export default BorderBox
