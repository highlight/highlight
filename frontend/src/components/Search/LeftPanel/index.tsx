import { Box } from '@highlight-run/ui/components'
import React from 'react'

type Props = {
	displayLeftPanel: boolean
}

export const LeftPanel: React.FC<Props> = ({ displayLeftPanel }) => {
	if (!displayLeftPanel) {
		return null
	}

	return (
		<Box
			borderRight="dividerWeak"
			height="full"
			position="relative"
			py="12"
			px="16"
			style={{ width: 250 }}
			display="flex"
			flexShrink={0}
			flexGrow={0}
		>
			Left Panel holding item
		</Box>
	)
}
