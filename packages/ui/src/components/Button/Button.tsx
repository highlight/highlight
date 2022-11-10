import React from 'react'
import { Button as AriakitButton, ButtonProps } from 'ariakit/button'
import { Text, Props as TextProps } from '../Text/Text'

import * as styles from './styles.css'
import { Box } from '../Box/Box'
import { IconProps } from '../icons'
import clsx from 'clsx'

type Props = ButtonProps &
	styles.Variants & {
		iconLeft?: React.ReactElement<IconProps>
		iconRight?: React.ReactElement<IconProps>
		onPress?: () => void
		cssClass?: string
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
					variant: variant,
					size: size,
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
					className={styles.iconVariants({ size })}
					height={size}
					width={size}
				>
					{iconLeft}
				</Box>
			)}
			{children && <Text size={textSize}>{children}</Text>}
			{iconRight && (
				<Box
					as="span"
					display="inline-flex"
					className={styles.iconVariants({ size })}
					height={size}
					width={size}
				>
					{iconRight}
				</Box>
			)}
		</AriakitButton>
	)
}
