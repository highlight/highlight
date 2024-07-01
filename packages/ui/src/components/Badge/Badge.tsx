import React from 'react'

import { Box, BoxProps } from '../Box/Box'
import { Props as TextProps, Text } from '../Text/Text'
import * as styles from './styles.css'

export type Props = styles.Variants & {
	iconStart?: React.ReactNode
	iconEnd?: React.ReactNode
	label?: string
	lines?: TextProps['lines']
} & Omit<BoxProps, 'size'>

export const Badge: React.FC<Props> = ({
	iconStart,
	iconEnd,
	label,
	lines,
	cssClass,
	size,
	shape,
	variant,
	...rest
}) => {
	let textSize: TextProps['size']
	switch (size) {
		case 'large':
			textSize = 'small'
			break
		default:
			textSize = 'xSmall'
	}

	let textColor: TextProps['color']
	switch (variant) {
		case 'red':
			textColor = 'r11'
			break
		case 'blue':
			textColor = 'lb700'
			break
		case 'yellow':
			textColor = 'y11'
			break
		case 'green':
			textColor = 'good'
			break
		case 'gray':
			textColor = 'default'
			break
		case 'outlineGray':
			textColor = 'default'
			break
		case 'outlinePurple':
			textColor = 'p6'
			break
		case 'white':
			textColor = 'moderate'
			break
		case 'purple':
			textColor = 'informative'
			break
		default:
			textColor = 'moderate'
	}

	return (
		<Box
			display="flex"
			flexDirection="row"
			alignItems="center"
			gap="2"
			cssClass={[styles.variants({ size, shape, variant }), cssClass]}
			{...rest}
		>
			{iconStart}
			{label && (
				<Text size={textSize} color={textColor} as="span" lines={lines}>
					{label}
				</Text>
			)}
			{iconEnd}
		</Box>
	)
}
