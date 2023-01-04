import { Tag } from './Tag'
import { Variants } from './styles.css'
import type { ComponentMeta } from '@storybook/react'
import React from 'react'
import { Box } from '../Box/Box'
import { IconSolidCheveronDown, IconSolidSave } from '../icons'

export default {
	title: 'Components/Tag',
	component: Tag,
} as ComponentMeta<typeof Tag>

export const TagVariants = () => {
	const emphasis: Variants['emphasis'][] = ['high', 'medium', 'low']
	const kind: Variants['kind'][] = ['primary', 'secondary']
	const shape: Variants['shape'][] = ['basic', 'rounded']
	const size: Variants['size'][] = ['small', 'medium', 'large']

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
												) : null
											}
											iconRight={
												jdx % emphasis.length === 0 ? (
													<IconSolidSave />
												) : null
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
											) : null
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
