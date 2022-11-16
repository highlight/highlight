import React from 'react'
import {
	mapResponsiveValue,
	OptionalResponsiveObject,
} from '../../css/sprinkles.css'
import { Box, BoxProps } from '../Box/Box'

const directionToFlexDirectionLookup = {
	horizontal: 'row',
	vertical: 'column',
} as const

const wrapFlexWrapLookup = {
	true: 'wrap',
	false: 'nowrap',
} as const

type Props = React.PropsWithChildren & {
	as?: BoxProps['as']
	align?: BoxProps['alignItems']
	direction?: OptionalResponsiveObject<'horizontal' | 'vertical'>
	flex?: BoxProps['flex']
	gap?: BoxProps['gap']
	justify?: BoxProps['justifyContent']
	wrap?: OptionalResponsiveObject<true | false>
}

export const Stack: React.FC<Props> = ({
	as = 'div',
	align,
	children,
	direction = 'vertical',
	flex,
	gap = '16',
	justify,
	wrap,
}) => {
	const flexDirection = mapResponsiveValue(
		direction,
		(value) => directionToFlexDirectionLookup[value],
	)
	const flexWrap: BoxProps['flexWrap'] = mapResponsiveValue(
		wrap,
		(value) => wrapFlexWrapLookup[String(value)],
	)

	return (
		<Box
			as={as}
			alignItems={align}
			display="flex"
			flexDirection={flexDirection}
			flex={flex}
			justifyContent={justify}
			gap={gap}
			flexWrap={flexWrap}
		>
			{children}
		</Box>
	)
}
