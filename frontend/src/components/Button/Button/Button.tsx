import analytics from '@util/analytics'
import clsx from 'clsx'
import React from 'react'

import styles from './Button.module.css'

type ButtonType = 'default' | 'primary' | 'ghost' | 'dashed' | 'link' | 'text'

// Local subset of button props, replacing antd ButtonProps
export type GenericHighlightButtonProps = {
	type?: ButtonType
	htmlType?: 'button' | 'submit' | 'reset'
	href?: string
	target?: string
	disabled?: boolean
	block?: boolean
	danger?: boolean
	icon?: React.ReactNode
	size?: 'large' | 'middle' | 'small'
	loading?: boolean | { delay?: number }
	shape?: 'default' | 'circle' | 'round'
	ghost?: boolean
	className?: string
	style?: React.CSSProperties
	onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>
	children?: React.ReactNode
	/** The ID used for identifying that this button was clicked for analytics. */
	trackingId: string
	trackProperties?: { [key: string]: string }
	/** Does this button only have an icon? */
	iconButton?: boolean
	/** Reduces the padding. */
	small?: boolean
	/** Set to true to make the button glow in intervals. */
	pulse?: boolean
	id?: string
	tabIndex?: number
	title?: string
	'aria-label'?: string
	'aria-describedby'?: string
	role?: string
	form?: string
	autoFocus?: boolean
}

const Button = ({
	children,
	trackingId,
	iconButton,
	small = false,
	trackProperties,
	type = 'default',
	htmlType = 'button',
	href,
	target,
	disabled,
	block,
	danger,
	icon,
	size,
	loading,
	shape,
	pulse,
	className,
	style,
	onClick,
	...props
}: GenericHighlightButtonProps) => {
	const isLoading =
		loading === true || (typeof loading === 'object' && loading !== null)
	const isDisabled = disabled || isLoading

	const buttonClass = clsx(className, styles.buttonBase, {
		[styles.primary]: type === 'primary',
		[styles.ghost]: type === 'ghost',
		[styles.dashed]: type === 'dashed',
		[styles.link]: type === 'link',
		[styles.text]: type === 'text',
		[styles.block]: block,
		[styles.danger]: danger,
		[styles.sizeLarge]: size === 'large',
		[styles.sizeSmall]: size === 'small',
		[styles.iconButton]: iconButton,
		[styles.small]: small,
		[styles.pulse]: pulse,
		[styles.circle]: shape === 'circle',
	})

	const handleClick = (
		e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
	) => {
		if (isDisabled) {
			e.preventDefault()
			return
		}
		if (onClick) {
			onClick(e)
		}
		analytics.track(`Button-${trackingId}`, trackProperties)
	}

	if (href) {
		return (
			<a
				href={href}
				target={target}
				className={buttonClass}
				style={style}
				onClick={
					handleClick as React.MouseEventHandler<HTMLAnchorElement>
				}
				rel={target === '_blank' ? 'noreferrer' : undefined}
				aria-disabled={isDisabled}
				{...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
			>
				{icon}
				{children}
			</a>
		)
	}

	return (
		<button
			type={htmlType}
			disabled={isDisabled}
			className={buttonClass}
			style={style}
			onClick={
				handleClick as React.MouseEventHandler<HTMLButtonElement>
			}
			{...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
		>
			{icon}
			{children}
		</button>
	)
}

export default Button
