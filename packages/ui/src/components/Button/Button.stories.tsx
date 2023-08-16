import { Meta } from '@storybook/react'

import { Button } from './Button'
import { Box } from '../Box/Box'
import { IconSolidCheveronDown, IconSolidSave } from '../icons'

export default {
	title: 'Components/Button',
	component: Button,
} as Meta<typeof Button>

export const ButtonVariants = () => {
	const kind = ['primary', 'secondary'] as const
	const emphasis = ['high', 'medium', 'low'] as const
	const size = ['medium', 'small', 'xSmall'] as const

	return (
		<Box display="flex" gap="12" flexDirection="column">
			{kind.map(($kind, idx) => (
				<Box key={idx} display="flex" gap="6" flexDirection="column">
					{emphasis.map(($emphasis, jdx) => (
						<Box
							display="flex"
							alignItems="flex-end"
							gap="4"
							key={`emp-${idx}-${jdx}`}
						>
							{size.map(($size, kdx) => (
								<Button
									iconLeft={
										jdx % emphasis.length !== 0 ? (
											<IconSolidCheveronDown />
										) : (
											<></>
										)
									}
									iconRight={
										jdx % emphasis.length === 0 ? (
											<IconSolidSave />
										) : (
											<></>
										)
									}
									size={$size}
									kind={$kind}
									emphasis={$emphasis}
									key={`b-${idx}-${jdx}-${kdx}`}
								>
									s:{$size}|e:{$emphasis}|k:{$kind}
								</Button>
							))}
							<Button
								kind={$kind}
								emphasis={$emphasis}
								key={`b-${idx}-${jdx}-d`}
								size={size[size.length - 1]}
								iconLeft={
									jdx % emphasis.length !== 0 ? (
										<IconSolidCheveronDown />
									) : (
										<></>
									)
								}
								disabled
							>
								{$emphasis}|{$kind}|disabled
							</Button>
						</Box>
					))}
				</Box>
			))}
		</Box>
	)
}
