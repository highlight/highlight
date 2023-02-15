import Button from '@components/Button/Button/Button'
import analytics from '@util/analytics'
import { ButtonType } from 'antd/lib/button'
import clsx from 'clsx'
import React from 'react'
import { Link, LinkProps } from 'react-router-dom'

import styles from './ButtonLink.module.scss'

type Props = {
	/** The ID used for identifying that this button was clicked for analytics. */
	trackingId: string
	className?: string
	/** Should this button be rendered as a <a>? */
	anchor?: boolean
	href?: string
	icon?: React.ReactNode
	fullWidth?: boolean
	disabled?: boolean
	type?: ButtonType
} & Partial<Pick<LinkProps, 'to' | 'onClick' | 'state'>>

const ButtonLink: React.FC<React.PropsWithChildren<Props>> = ({
	to,
	children,
	trackingId,
	className,
	anchor,
	href,
	icon,
	fullWidth,
	disabled,
	type,
	onClick,
	state,
}) => {
	if (disabled) {
		return (
			<Button
				type={type}
				disabled
				trackingId={trackingId}
				className={clsx(styles.link, className, {
					[styles.withIcon]: icon,
					[styles.fullWidth]: fullWidth,
				})}
			>
				{icon}
				{children}
			</Button>
		)
	}

	if (anchor) {
		if (!href) {
			throw new Error('href needs to be defined.')
		}
		return (
			<a
				href={href}
				className={clsx(styles.link, className, {
					[styles.withIcon]: icon,
					[styles.fullWidth]: fullWidth,
					[styles.defaultButtonStyles]: type === 'default',
				})}
				onClick={(e) => {
					analytics.track(`Link-${trackingId}`)
					onClick && onClick(e)
				}}
				target="_blank"
				rel="noreferrer"
			>
				{children}
			</a>
		)
	}

	if (!to) {
		throw new Error('to needs to be defined.')
	}

	return (
		<Link
			to={to}
			className={clsx(styles.link, className, {
				[styles.withIcon]: icon,
				[styles.fullWidth]: fullWidth,
				[styles.to]: type !== 'default',
				[styles.defaultButtonStyles]: type === 'default',
			})}
			onClick={(e) => {
				analytics.track(`Link-${trackingId}`)
				onClick && onClick(e)
			}}
			state={state}
		>
			{icon}
			{children}
		</Link>
	)
}

export default ButtonLink
