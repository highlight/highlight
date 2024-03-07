import { Meta } from '@storybook/react'

import { colors } from '../../css/colors'
import { Box } from '../Box/Box'
import { Text } from '../Text/Text'

export const Palette = () => (
	<>
		{Object.keys(colors).map((name) => {
			return (
				<div key={name}>
					<Box
						background={name as keyof typeof colors}
						padding="10"
						textTransform="capitalize"
					>
						<Text>{name}</Text>
					</Box>
					<br />
				</div>
			)
		})}
	</>
)

export default {
	title: 'Foundations/Colors',
	component: Palette,
} as Meta<typeof Palette>
