import { Meta } from '@storybook/react'

import { Box } from '../Box/Box'
import { IconSolidCheveronDown } from '../icons'
import { ButtonIcon } from './ButtonIcon'

export default {
	title: 'Components/ButtonIcon',
	component: ButtonIcon,
} as Meta<typeof ButtonIcon>

export const AllVariants = () => {
	const variant = ['primary', 'secondary'] as const
	const shape = ['square', 'thin'] as const
	const emphasis = ['high', 'medium', 'low'] as const
	const size = ['medium', 'small', 'xSmall', 'minimal'] as const

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
