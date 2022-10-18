import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { colors } from '../../css/colors'
import { Card } from '../Card/Card'

export const Palette = () => (
	<>
		{Object.keys(colors).map((name) => {
			return (
				<Card background={name} padding="large">
					{name}
				</Card>
			)
		})}
	</>
)

export default {
	title: 'Colors',
	component: Palette,
} as ComponentMeta<typeof Palette>
