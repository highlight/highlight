import React from 'react'
import { Meta } from '@storybook/react'

import { ButtonIcon } from './ButtonIcon'
import { Box } from '../Box/Box'
import { IconSolidCheveronDown } from '../icons'

export default {
	title: 'Components/ButtonIcon',
	component: ButtonIcon,
} as Meta<typeof ButtonIcon>

export const AllVariants = () => {
	const variant: any[] = ['primary', 'secondary']
	const shape: any[] = ['square', 'thin']
	const emphasis: any[] = ['high', 'medium', 'low']
	const size: any[] = ['medium', 'small', 'xSmall', 'minimal']

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
											icon={
												<IconSolidCheveronDown
													size={12}
												/>
											}
											size={$size}
											kind={$kind}
											emphasis={$emphasis}
											shape={$shape}
											key={`${idx}-${jdx}-${kdx}-${ldx}`}
										/>
									))}

									<ButtonIcon
										disabled
										icon={
											<IconSolidCheveronDown size={12} />
										}
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
