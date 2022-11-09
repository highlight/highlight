import React from 'react'
import { Button as AriakitButton, ButtonProps } from 'ariakit/button'
import { Text, Props as TextProps } from '../Text/Text'

import * as styles from './styles.css'
import { Box } from '../Box/Box'
import { IconProps } from '../icons'
import clsx from 'clsx'

type Props = ButtonProps &
	styles.Variants & {
		icon?: React.ReactElement<IconProps>
		iconLeft?: React.ReactElement<IconProps>
		iconRight?: React.ReactElement<IconProps>
		onPress?: () => void
	}

const buttonToTextSize = {
	small: 'xSmall',
	medium: 'xSmall',
	large: 'small',
} as const

export const Tag: React.FC<React.PropsWithChildren<Props>> = ({
	children,
	icon,
	iconLeft,
	iconRight,
	shape = styles.defaultShape,
	size = styles.defaultSize,
	variant = styles.defaultVariant,
	shape = styles.defaultShape,
	className,
	...buttonProps
}) => {
	const textSize: TextProps['size'] = buttonToTextSize[size]
	icon = icon || iconLeft

	return (
		<AriakitButton
			as="button"
			className={clsx([
				className,
				styles.variants({
					variant,
					size,
					shape,
				}),
			])}
			{...buttonProps}
		>
			{icon && (
				<Box
					as="span"
					display="inline-flex"
					className={styles.iconVariants({ size, variant })}
				>
					{icon}
				</Box>
			)}
			{children && (
				<Text size={textSize} userSelect="none">
					{children}
				</Text>
			)}
			{iconRight && (
				<Box
					as="span"
					display="inline-flex"
					className={styles.iconVariants({ size, variant })}
				>
					{iconRight}
				</Box>
			)}
		</AriakitButton>
	)
}
