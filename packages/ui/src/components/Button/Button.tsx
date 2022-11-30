import React from 'react'
import { Button as AriakitButton, ButtonProps } from 'ariakit/button'
import { Text, Props as TextProps } from '../Text/Text'

import * as styles from './styles.css'
import { Box } from '../Box/Box'
import { IconProps } from '../icons'
import clsx, { ClassValue } from 'clsx'

export type HighlightButtonProps = React.PropsWithChildren<
	ButtonProps &
		styles.Variants & {
			iconLeft?: React.ReactElement<IconProps>
			iconRight?: React.ReactElement<IconProps>
			loading?: boolean
			onPress?: () => void
			cssClass?: ClassValue[]
		}
>

const buttonToTextSize = {
	xSmall: 'xSmall',
	small: 'small',
	medium: 'small',
	large: 'small',
	xLarge: 'large',
} as const

export const Button: React.FC<HighlightButtonProps> = ({
	children,
	iconLeft,
	iconRight,
	size = styles.defaultSize,
	kind,
	emphasis,
	className,
	cssClass,
	loading,
	...buttonProps
}) => {
	const textSize: TextProps['size'] = buttonToTextSize[size]

	return (
		<AriakitButton
			as="button"
			className={clsx(
				styles.variants({
					kind,
					size,
					emphasis,
				}),
				className,
				cssClass,
			)}
			{...buttonProps}
		>
			{loading ? (
				<Text>loading...</Text>
			) : (
				<>
					{iconLeft && (
						<Box
							as="span"
							display="inline-flex"
							className={styles.iconVariants({
								size,
								emphasis,
								kind,
							})}
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
							className={styles.iconVariants({
								size,
								emphasis,
								kind,
							})}
						>
							{iconRight}
						</Box>
					)}
				</>
			)}
		</AriakitButton>
	)
}
