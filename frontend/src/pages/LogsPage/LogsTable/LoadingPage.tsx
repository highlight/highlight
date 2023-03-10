import { Box, Text } from '@highlight-run/ui'
import React from 'react'

type Style = {
	top: number | 'auto'
	bottom: number | 'auto'
	left: string
	width: number
}

export const LoadingPage = ({ alignTop }: { alignTop: boolean }) => {
	const style: Style = {
		top: 'auto',
		bottom: 20,
		left: 'calc(50% - 150px)',
		width: 300,
	}
	if (alignTop) {
		style.top = 20
		style.bottom = 'auto'
	}
	return (
		<Box
			backgroundColor="white"
			border="dividerWeak"
			display="flex"
			flexGrow={1}
			alignItems="center"
			justifyContent="center"
			padding="12"
			position="fixed"
			shadow="small"
			borderRadius="6"
			textAlign="center"
			style={style}
		>
			<Text color="weak">Loading...</Text>
		</Box>
	)
}
