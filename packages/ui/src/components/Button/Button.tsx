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
		iconRight?: React.ReactElement<IconProps>
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
			...buttonProps
		},
		ref,
	) => {
		return (
			<AriakitButton
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
				<ButtonContent
					iconLeft={iconLeft}
					iconRight={iconRight}
					size={size}
					kind={kind}
					emphasis={emphasis}
					disabled={disabled}
				>
					{children}
				</ButtonContent>
			</AriakitButton>
		)
	},
)

type ButtonContentProps = Pick<
	ButtonProps,
	| 'children'
	| 'disabled'
	| 'emphasis'
	| 'iconLeft'
	| 'iconRight'
	| 'kind'
	| 'size'
>
export const ButtonContent: React.FC<ButtonContentProps> = ({
	children,
	disabled,
	emphasis,
	iconLeft,
	iconRight,
	kind,
	size = styles.defaultSize,
}) => {
	const textSize: TextProps['size'] = buttonToTextSize[size]

	return (
		<>
			{iconLeft && (
				<Box
					as="span"
					display="inline-flex"
					disabled={disabled}
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
					disabled={disabled}
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
	)
}
