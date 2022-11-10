import React from 'react'
import { Button as AriakitButton, ButtonProps } from 'ariakit/button'
import { Text, Props as TextProps } from '../Text/Text'

import * as styles from './styles.css'
import { Box } from '../Box/Box'
import { IconProps } from '../icons'
import clsx, { ClassValue } from 'clsx'

type Props = ButtonProps &
	styles.Variants & {
		iconLeft?: React.ReactElement<IconProps>
		iconRight?: React.ReactElement<IconProps>
		onPress?: () => void
		cssClass?: ClassValue[]
	}

const buttonToTextSize = {
	xSmall: 'xSmall',
	small: 'small',
	medium: 'small',
	large: 'small',
	xLarge: 'large',
} as const

export const Button: React.FC<React.PropsWithChildren<Props>> = ({
	children,
	iconLeft,
	iconRight,
	size = styles.defaultSize,
	variant,
	emphasis,
	className,
	cssClass,
	...buttonProps
}) => {
	const textSize: TextProps['size'] = buttonToTextSize[size]

	return (
		<AriakitButton
			as="button"
			className={clsx(
				styles.variants({
					variant,
					size,
					emphasis,
				}),
				className,
				cssClass,
			)}
			{...buttonProps}
		>
			{iconLeft && (
				<Box
					as="span"
					display="inline-flex"
					className={styles.iconVariants({ size, emphasis, variant })}
					height={size}
					width={size}
				>
					{iconLeft}
				</Box>
			)}
			{children && (
				<Text userSelect="none" size={textSize}>
					{children}
				</Text>
			)}
			{iconRight && (
				<Box
					as="span"
					display="inline-flex"
					className={styles.iconVariants({ size, emphasis, variant })}
					height={size}
					width={size}
				>
					{iconRight}
				</Box>
			)}
		</AriakitButton>
	)
}
