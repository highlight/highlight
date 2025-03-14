import { Box } from '@highlight-run/ui/components'
import { PropsWithChildren } from 'react'

export const SidebarSection = (props: PropsWithChildren) => {
	return (
		<Box
			p="6"
			width="full"
			display="flex"
			flexDirection="column"
			gap="12"
			border="divider"
			borderRadius="6"
		>
			{props.children}
		</Box>
	)
}
