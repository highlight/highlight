import type { Meta } from '@storybook/react'

import { Box } from '../Box/Box'
import { IconSolidCheveronDown, IconSolidSave } from '../icons'
import { Tag } from './Tag'

export default {
	title: 'Components/Tag',
	component: Tag,
} as Meta<typeof Tag>

export const TagVariants = () => {
	const emphasis = ['high', 'medium', 'low'] as const
	const kind = ['primary', 'secondary'] as const
	const shape = ['basic', 'rounded'] as const
	const size = ['small', 'medium', 'large'] as const

	return (
		<Box display="flex" gap="12" flexDirection="column">
			{kind.map(($kind, idx) => (
				<Box key={idx} display="flex" gap="6" flexDirection="column">
					{emphasis.map(($emphasis, jdx) => (
						<Box
							display="flex"
							alignItems="center"
							gap="4"
							key={`emp-${idx}-${jdx}`}
						>
							{size.map(($size, kdx) => (
								<Box key={kdx} my="12">
									{shape.map(($shape, sdx) => (
										<Tag
											icon={
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
											key={`b-${idx}-${jdx}-${kdx}-${sdx}`}
										>
											k:{$kind}|e:{$emphasis}|s:{$size}|s:
											{$shape}
										</Tag>
									))}

									<Tag
										kind={$kind}
										emphasis={$emphasis}
										key={`b-${idx}-${jdx}-d`}
										size={$size}
										iconLeft={
											jdx % emphasis.length !== 0 ? (
												<IconSolidCheveronDown />
											) : (
												<></>
											)
										}
										disabled
									>
										{$emphasis}|{$kind}|{$size}|disabled
									</Tag>
								</Box>
							))}
						</Box>
					))}
				</Box>
			))}
		</Box>
	)
}
