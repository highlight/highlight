import { Button as UiButton, ButtonProps as UiButtonProps } from '@highlight-run/ui/components'
import analytics from '@util/analytics'
import clsx from 'clsx'
import React from 'react'

import styles from './Button.module.css'

type AntdButtonType = 'primary' | 'default' | 'dashed' | 'text' | 'link'
type AntdButtonSize = 'large' | 'middle' | 'small'

export type GenericHighlightButtonProps = {
	/** The ID used for identifying that this button was clicked for analytics. */
	trackingId: string
	trackProperties?: { [key: string]: string }
	/** Does this button only have an icon? */
	iconButton?: boolean
	/** Reduces the padding. */
	small?: boolean
	/** Set to true to make the button glow in intervals. */
	pulse?: boolean
	/** antd-compatible type prop */
	type?: AntdButtonType | 'submit' | 'reset'
	/** antd-compatible size prop */
	size?: AntdButtonSize
	/** antd-compatible danger prop */
	danger?: boolean
	/** antd-compatible loading prop */
	loading?: boolean
	/** antd-compatible block prop */
	block?: boolean
	/** antd-compatible ghost prop */
	ghost?: boolean
	/** antd-compatible icon prop */
	icon?: React.ReactNode
	/** antd-compatible href prop */
	href?: string
	/** antd-compatible htmlType prop */
	htmlType?: 'submit' | 'reset' | 'button'
	/** antd-compatible disabled prop */
	disabled?: boolean
	className?: string
	onClick?: (e: React.MouseEvent<HTMLElement>) => void
	children?: React.ReactNode
	style?: React.CSSProperties
}

const mapTypeToKind = (
	type?: AntdButtonType | 'submit' | 'reset',
	danger?: boolean,
): { kind: UiButtonProps['kind']; emphasis: UiButtonProps['emphasis'] } => {
	if (danger) return { kind: 'danger', emphasis: 'high' }
	switch (type) {
		case 'primary':
			return { kind: 'primary', emphasis: 'high' }
		case 'text':
			return { kind: 'secondary', emphasis: 'low' }
		case 'link':
			return { kind: 'primary', emphasis: 'low' }
		case 'dashed':
			return { kind: 'secondary', emphasis: 'medium' }
		default:
			return { kind: 'secondary', emphasis: 'high' }
	}
}

const mapSize = (size?: AntdButtonSize): UiButtonProps['size'] => {
	switch (size) {
		case 'large':
			return 'medium'
		case 'small':
			return 'xSmall'
		default:
			return 'small'
	}
}

const Button = ({
	children,
	trackingId,
	iconButton,
	small = false,
	trackProperties,
	type,
	danger,
	loading,
	block,
	ghost,
	icon,
	href,
	htmlType,
	size,
	className,
	disabled,
	style,
	onClick,
	...rest
}: React.PropsWithChildren<GenericHighlightButtonProps>) => {
	const { kind, emphasis } = mapTypeToKind(type, danger)
	const mappedSize = small ? 'xSmall' : mapSize(size)

	const handleClick = (e: React.MouseEvent<HTMLElement>) => {
		if (onClick) {
			onClick(e)
		}
		analytics.track(`Button-${trackingId}`, trackProperties)
	}

	const buttonClassName = clsx(className, styles.buttonBase, {
		[styles.iconButton]: iconButton,
		[styles.small]: small,
		[styles.link]: type === 'link',
		[styles.pulse]: rest.pulse,
	})

	if (href && type !== 'submit') {
		return (
			<a
				href={href}
				target={type === 'text' ? '_blank' : undefined}
				className={buttonClassName}
				style={style}
			>
				<UiButton
					kind={kind}
					emphasis={emphasis}
					size={mappedSize}
					disabled={disabled || loading}
					iconLeft={icon as React.ReactElement}
					cssClass={buttonClassName}
					onClick={handleClick}
					style={style}
				>
					{children}
				</UiButton>
			</a>
		)
	}

	return (
		<UiButton
			kind={kind}
			emphasis={emphasis}
			size={mappedSize}
			disabled={disabled || loading}
			iconLeft={icon as React.ReactElement}
			cssClass={buttonClassName}
			onClick={handleClick}
			type={htmlType}
			style={{
				...(block ? { width: '100%', justifyContent: 'center' } : {}),
				...(ghost ? { borderColor: 'var(--color-gray-300)' } : {}),
				...style,
			}}
		>
			{children}
		</UiButton>
	)
}

export default Button
