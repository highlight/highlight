import React from 'react'
import { BorderProps } from '../../css/borders'
import { Sprinkles } from '../../css/sprinkles.css'
import { Box, Props as BoxProps } from '../Box/Box'

export interface Props extends React.PropsWithChildren, BorderProps {
	background?: Sprinkles['background']
	borderRadius?: Sprinkles['borderRadius']
	color?: Sprinkles['color']
	padding?: Sprinkles['padding']
}

export const Card: React.FC<Props> = ({ children, ...rest }) => {
	const defaultProps: Partial<Sprinkles> = {
		background: {
			lightMode: 'white',
			darkMode: 'purple900',
		},
		color: {
			lightMode: 'black',
			darkMode: 'white',
		},
	}

	return (
		<Box {...defaultProps} {...rest}>
			{children}
		</Box>
	)
}
