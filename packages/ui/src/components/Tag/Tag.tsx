import { Button as AriakitButton, ButtonProps } from '@ariakit/react'
import clsx, { ClassValue } from 'clsx'
import React from 'react'

import { Box } from '../Box/Box'
import { IconProps } from '../icons'
import { Props as TextProps, Text } from '../Text/Text'
import * as styles from './styles.css'

export type Props = ButtonProps &
	styles.Variants & {
		/** An alias for iconLeft as a convenience for icon-only tags. */
		icon?: React.ReactElement<IconProps>
		iconLeft?: React.ReactElement<IconProps>
		iconRight?: React.ReactElement<IconProps>
		className?: ClassValue | ClassValue[]
		lines?: TextProps['lines']
		wordBreak?: TextProps['break']
		onIconLeftClick?: () => void
		onIconRightClick?: () => void
	}

const buttonToTextSize = {
	small: 'xSmall',
	medium: 'xSmall',
	large: 'small',
} as const

export const Tag: React.FC<React.PropsWithChildren<Props>> = ({
	children,
	className,
	icon,
	iconLeft,
	iconRight,
	emphasis = styles.defaultEmphasis,
	shape = styles.defaultShape,
	size = styles.defaultSize,
	kind = styles.defaultKind,
	lines,
	wordBreak,
	onIconLeftClick,
	onIconRightClick,
	...buttonProps
}) => {
	const textSize: TextProps['size'] = buttonToTextSize[size]
	icon = icon || iconLeft

	return (
		<AriakitButton
			render={<button />}
			className={clsx([
				className,
				styles.variants({
					emphasis,
					kind,
					size,
					shape,
				}),
			])}
			style={{ cursor: buttonProps.onClick ? 'pointer' : 'default' }}
			type="button"
			{...buttonProps}
		>
			{icon && (
				<Box
					as="span"
					display="inline-flex"
					cssClass={styles.iconVariants({ size })}
					onClick={onIconLeftClick}
				>
					{icon}
				</Box>
			)}
			{children && (
				<Text
					lines={lines}
					size={textSize}
					userSelect="none"
					color="inherit"
					display="inline-flex"
					break={wordBreak}
				>
					{children}
				</Text>
			)}
			{iconRight && (
				<Box
					as="span"
					display="inline-flex"
					cssClass={styles.iconVariants({ size })}
					onClick={onIconRightClick}
				>
					{iconRight}
				</Box>
			)}
		</AriakitButton>
	)
}
