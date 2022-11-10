import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Button } from './Button'
import { Box } from '../Box/Box'
import { IconCaretDown, IconCreateFile } from '../icons'
import { Variants } from './styles.css'

export default {
	title: 'Components/Button',
	component: Button,
} as ComponentMeta<typeof Button>

export const ButtonVariants = () => {
	const variant: Variants['variant'][] = ['primary', 'secondary']
	const emphasis: Variants['emphasis'][] = ['high', 'medium', 'low']
	const size: Variants['size'][] = ['xSmall', 'small', 'medium']

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
							{size.map(($size, kdx) => (
								<Button
									iconLeft={
										jdx % emphasis.length !== 0 ? (
											<IconCaretDown />
										) : null
									}
									iconRight={
										jdx % emphasis.length === 0 ? (
											<IconCreateFile />
										) : null
									}
									size={$size}
									variant={$variant}
									emphasis={$emphasis}
									key={`b-${idx}-${jdx}-${kdx}`}
								>
									s:{$size}|e:{$emphasis}|v:{$variant}
								</Button>
							))}
							<Button
								variant={$variant}
								emphasis={$emphasis}
								key={`b-${idx}-${jdx}-d`}
								size={size[size.length - 1]}
								iconLeft={
									jdx % emphasis.length !== 0 ? (
										<IconCaretDown />
									) : null
								}
								disabled
							>
								{$emphasis}|{$variant}|disabled
							</Button>
						</Box>
					))}
				</Box>
			))}
		</Box>
	)
}
