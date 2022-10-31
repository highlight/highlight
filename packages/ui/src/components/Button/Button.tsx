import React from 'react'
import { Button as AriakitButton, ButtonProps } from 'ariakit/button'
import { Text, Props as TextProps } from '../Text/Text'

import * as styles from './styles.css'
import { Box } from '../Box/Box'
import { IconProps } from '../icons'

type Props = ButtonProps &
	styles.Variants & {
		children: React.ReactNode
		iconLeft?: React.ReactElement<IconProps>
		iconRight?: React.ReactElement<IconProps>
		onPress?: () => void
	}

const buttonToTextSize = {
	xSmall: 'xSmall',
	small: 'small',
	medium: 'small',
	large: 'small',
	xLarge: 'large',
} as const

export const Button: React.FC<Props> = ({
	children,
	iconLeft,
	iconRight,
	size = styles.defaultSize,
	variant,
	...buttonProps
}) => {
	const textSize: TextProps['size'] = buttonToTextSize[size]

	return (
		<AriakitButton
			as="button"
			className={styles.variants({
				variant: variant,
				size: size,
			})}
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
					{React.cloneElement(iconLeft)}
				</Box>
			)}
			<Text size={textSize}>{children}</Text>
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
