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
	as,
	align,
	children,
	direction,
	flex,
	gap,
	justify,
	wrap,
}) => {
	if (typeof wrap === 'boolean') {
		wrap = wrap ? 'wrap' : undefined
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

Stack.defaultProps = {
	as: 'div',
	gap: '16',
	direction: 'column',
}
