import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { ButtonIcon } from './ButtonIcon'
import { Box } from '../Box/Box'
import { IconCaretDown } from '../icons'
import { Variants } from './styles.css'

export default {
	title: 'Components/ButtonIcon',
	component: ButtonIcon,
} as ComponentMeta<typeof ButtonIcon>

export const ButtonIconVariants = () => {
	const variant: Variants['kind'][] = ['primary', 'secondary']
	const shape: Variants['shape'][] = ['square', 'thin']
	const emphasis: Variants['emphasis'][] = ['high', 'medium', 'low']
	const size: Variants['size'][] = ['medium', 'small', 'tiny']

	return (
		<Box display="flex" gap="12" flexDirection="column">
			{variant.map(($variant, idx) => (
				<Box key={idx} display="flex" gap="6" flexDirection="column">
					{emphasis.map(($emphasis, jdx) => (
						<Box
							display="flex"
							alignItems="center"
							gap="4"
							key={`emp-${idx}-${jdx}`}
						>
							{size.map(($size, kdx) =>
								shape.map(($shape, ldx) => (
									<ButtonIcon
										icon={<IconCaretDown />}
										size={$size}
										kind={$variant}
										emphasis={$emphasis}
										shape={$shape}
										key={`${idx}-${jdx}-${kdx}-${ldx}`}
									/>
								)),
							)}
						</Box>
					))}
					<ButtonIcon
						kind={$variant}
						emphasis="none"
						key={`b-${idx}-m`}
						size="minimal"
						icon={<IconCaretDown />}
					/>
				</Box>
			))}
		</Box>
	)
}
