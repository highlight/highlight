import React from 'react'
import {
	Button as AriakitButton,
	ButtonProps as AriakitButtonProps,
} from 'ariakit/button'
import { Props as TextProps, Text } from '../Text/Text'

import * as styles from './styles.css'
import { Box } from '../Box/Box'
import { IconProps } from '../icons'
import clsx, { ClassValue } from 'clsx'

export type ButtonProps = React.PropsWithChildren &
	AriakitButtonProps &
	styles.Variants & {
		iconLeft?: React.ReactElement<IconProps>
		onIconLeftClick?: React.MouseEventHandler<HTMLButtonElement>
		iconRight?: React.ReactElement<IconProps>
		onIconRightClick?: React.MouseEventHandler<HTMLButtonElement>
		onPress?: () => void
		cssClass?: ClassValue | ClassValue[]
	}

const buttonToTextSize = {
	xSmall: 'xSmall',
	small: 'small',
	medium: 'small',
	large: 'small',
	xLarge: 'large',
} as const

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			children,
			iconLeft,
			iconRight,
			size = styles.defaultSize,
			kind,
			emphasis,
			className,
			cssClass,
			disabled,
			display,
			onIconLeftClick,
			onIconRightClick,
			...buttonProps
		},
		ref,
	) => {
		const textSize: TextProps['size'] = buttonToTextSize[size]
		const hasInternalButtons = !!onIconLeftClick || !!onIconRightClick

		return (
			<AriakitButton
				as={hasInternalButtons ? 'div' : 'button'}
				disabled={disabled}
				className={clsx(
					styles.variants({
						kind,
						size,
						emphasis,
						display,
					}),
					className,
					cssClass,
				)}
				ref={ref}
				{...buttonProps}
			>
				{iconLeft && (
					<Box
						as={hasInternalButtons ? 'div' : 'span'}
						display="inline-flex"
						disabled={disabled}
						className={styles.iconVariants({
							size,
							emphasis,
							kind,
						})}
						onClick={onIconLeftClick}
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
						as={hasInternalButtons ? 'div' : 'span'}
						display="inline-flex"
						disabled={disabled}
						className={styles.iconVariants({
							size,
							emphasis,
							kind,
						})}
						onClick={onIconRightClick}
					>
						{iconRight}
					</Box>
				)}
			</AriakitButton>
		)
	},
)
