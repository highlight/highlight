import React from 'react'
import { Button as AriakitButton, ButtonProps } from 'ariakit/button'
import { Text } from '../Text/Text'

import * as styles from './styles.css'
import { typographyStyles } from '../Text/styles.css'
import { Box } from '../Box/Box'
import { IconProps } from '../icons'

type Props = ButtonProps &
	styles.Variants & {
		children: React.ReactNode
		iconLeft?: React.ReactElement<IconProps>
		iconRight?: React.ReactElement<IconProps>
		onPress?: () => void
	}

const buttonToTextSize: Record<
	styles.Variants['size'],
	keyof typeof typographyStyles.size
> = {
	xSmall: 'xSmall',
	small: 'small',
	medium: 'small',
	large: 'small',
	xLarge: 'large',
}

export const Button: React.FC<Props> = ({
	children,
	iconLeft,
	iconRight,
	...props
}) => {
	const textSize = buttonToTextSize[props.size]

	return (
		<AriakitButton
			as="button"
			className={styles.variants({
				variant: props.variant,
				size: props.size,
			})}
			{...props}
		>
			{iconLeft && (
				<Box
					as="span"
					display="inline-flex"
					className={styles.iconVariants({ size: props.size })}
					height={props.size}
					width={props.size}
				>
					{React.cloneElement(iconLeft)}
				</Box>
			)}
			<Text size={textSize} weight="semibold">
				{children}
			</Text>
			{iconRight && (
				<Box
					as="span"
					display="inline-flex"
					className={styles.iconVariants({ size: props.size })}
					height={props.size}
					width={props.size}
				>
					{React.cloneElement(iconRight)}
				</Box>
			)}
		</AriakitButton>
	)
}
