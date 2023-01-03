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
	switch (rest.variant) {
		case 'green':
			textColor = 'good'
			break
		case 'grey':
			textColor = 'moderate'
			break
		case 'outlineGrey':
			textColor = 'moderate'
			break
		case 'white':
			textColor = 'moderate'
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
			cssClass={[styles.variants({ ...rest })]}
		>
			{iconStart}
			{label && (
				<Text size={textSize} color={textColor} as="span">
					{label}
				</Text>
			)}
			{iconEnd}
		</Box>
	)
}
