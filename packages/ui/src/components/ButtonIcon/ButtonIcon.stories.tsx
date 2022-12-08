import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { ButtonIcon } from './ButtonIcon'
import { Box } from '../Box/Box'
import { IconChevronDown } from '../icons'
import { Variants } from './styles.css'

export default {
	title: 'Components/ButtonIcon',
	component: ButtonIcon,
} as ComponentMeta<typeof ButtonIcon>

export const AllVariants = () => {
	const variant: Variants['kind'][] = ['primary', 'secondary']
	const shape: Variants['shape'][] = ['square', 'thin']
	const emphasis: Variants['emphasis'][] = ['high', 'medium', 'low']
	const size: Variants['size'][] = ['medium', 'small', 'xSmall', 'minimal']

	return (
		<Box display="flex" gap="12" flexDirection="column">
			{variant.map(($kind, idx) => (
				<Box key={idx} display="flex" gap="6" flexDirection="column">
					{emphasis.map(($emphasis, jdx) => (
						<Box
							display="flex"
							alignItems="center"
							gap="4"
							key={`emp-${idx}-${jdx}`}
						>
							{size.map(($size, kdx) => (
								<>
									{shape.map(($shape, ldx) => (
										<ButtonIcon
											icon={<IconChevronDown size={12} />}
											size={$size}
											kind={$kind}
											emphasis={$emphasis}
											shape={$shape}
											key={`${idx}-${jdx}-${kdx}-${ldx}`}
										/>
									))}

									<ButtonIcon
										disabled
										icon={<IconChevronDown size={12} />}
										size={$size}
										kind={$kind}
										emphasis={$emphasis}
										key={`${idx}-${jdx}-${kdx}-disabled`}
									/>
								</>
							))}
						</Box>
					))}
				</Box>
			))}
		</Box>
	)
}
