import React from 'react'
import { Box, BoxProps } from '../Box/Box'

type Props = React.PropsWithChildren & {
	as?: BoxProps['as']
	align?: BoxProps['alignItems']
	direction?: BoxProps['flexDirection']
	flex?: BoxProps['flex']
	gap?: BoxProps['gap']
	justify?: BoxProps['justifyContent']
	wrap?: boolean | BoxProps['flexWrap']
}

export const Stack: React.FC<Props> = ({
	as = 'div',
	align,
	children,
	direction,
	flex,
	gap = '16',
	justify,
	wrap,
}) => {
	if (typeof wrap === 'boolean') {
		wrap = 'wrap'
	}

	return (
		<Box
			as={as}
			alignItems={align}
			display="flex"
			flexDirection={direction}
			flex={flex}
			justifyContent={justify}
			gap={gap}
			flexWrap={wrap}
		>
			{children}
		</Box>
	)
}
