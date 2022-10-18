import React from 'react'
import { Sprinkles } from '../../css/sprinkles.css'
import { Box } from '../Box/Box'

interface Props extends React.PropsWithChildren {
	borderColor?: keyof Sprinkles['borderColor']
	borderRadius?: keyof Sprinkles['borderRadius']
	color?: keyof Sprinkles['color']
	padding?: keyof Sprinkles['padding']
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
