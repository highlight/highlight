import React from 'react'
import { Box } from '../Box/Box'
import { Text, Props as TextProps } from '../Text/Text'

import * as styles from './styles.css'

export type Props = styles.Variants & {
	iconStart?: React.ReactNode
	iconEnd?: React.ReactNode
	label?: string
}

export const Badge: React.FC<Props> = ({
	iconStart,
	iconEnd,
	label,
	...rest
}) => {
	let textSize: TextProps['size']
	switch (rest.size) {
		case 'large':
			textSize = 'small'
			break
		default:
			textSize = 'xSmall'
	}

	let textColor: TextProps['color']
	switch (rest.theme) {
		case 'green':
			textColor = 'white'
			break
		case 'grey':
			textColor = 'neutral500'
			break
		case 'outlineGrey':
			textColor = 'neutral500'
			break
		case 'white':
			textColor = 'neutral700'
			break
		default:
			textColor = 'neutral700'
	}
	console.log(':::', rest.theme)
	return (
		<Box
			display="flex"
			alignItems="center"
			gap="xxSmall"
			width="fit-content"
			cssClass={[styles.variants({ ...rest })]}
		>
			{iconStart}

			{label && (
				<Text
					weight="semibold"
					size={textSize}
					color={textColor}
					as="span"
				>
					{label}
				</Text>
			)}
			{iconEnd}
		</Box>
	)
}
