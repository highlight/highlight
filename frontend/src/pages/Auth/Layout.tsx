import { Box, BoxProps, Callout } from '@highlight-run/ui/components'
import React from 'react'

type Props = React.PropsWithChildren & {
	py?: BoxProps['py']
	px?: BoxProps['px']
}

export const AuthHeader: React.FC<Props> = ({
	children,
	py = '12',
	px = '20',
}) => {
	return (
		<Box
			backgroundColor="n2"
			borderBottom="dividerWeak"
			btr="8"
			py={py}
			px={px}
			textAlign="center"
		>
			{children}
		</Box>
	)
}

export const AuthBody: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<Box backgroundColor="default" py="16" px="20">
			{children}
		</Box>
	)
}

export const AuthFooter: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<Box
			backgroundColor="n2"
			borderTop="dividerWeak"
			bbr="8"
			py="12"
			px="20"
			display="flex"
			flexDirection="column"
			gap="16"
		>
			{children}
		</Box>
	)
}

export const AuthError: React.FC<React.PropsWithChildren> = ({ children }) => {
	return <Callout kind="error">{children}</Callout>
}
