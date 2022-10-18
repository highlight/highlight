import React from 'react'
import spaces from '../../css/spaces'
import type { Sprinkles } from '../../css/sprinkles.css'
import Box from '../Box/Box'

interface Props extends React.PropsWithChildren {
	color: keyof Sprinkles['color']
	padding: keyof typeof spaces
}

const Card: React.FC<Props> = ({ children, color, padding }) => {
	return (
		<Box
			p={
				padding || {
					mobile: 'small',
					tablet: 'medium',
					desktop: 'large',
				}
			}
			color={color}
		>
			{children}
		</Box>
	)
}

export default Card
