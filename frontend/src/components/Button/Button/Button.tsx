import analytics from '@util/analytics'
import { Button as AntDesignButton, ButtonProps } from 'antd'
import React from 'react'

import styles from './Button.module.scss'

export type GenericHighlightButtonProps = ButtonProps & {
	/** The ID used for identifying that this button was clicked for analytics. */
	trackingId: string
	trackProperties?: { [key: string]: string }
	/** Does this button only have an icon? */
	iconButton?: boolean
	/** Reduces the padding. */
	small?: boolean
	/** Set to true to make the button glow in intervals. */
	pulse?: boolean
}

const Button = ({
	children,
	trackingId,
	iconButton,
	small = false,
	trackProperties,
	...props
}: React.PropsWithChildren<GenericHighlightButtonProps>) => {
	return (
		<AntDesignButton
			{...props}
			onClick={(e) => {
				if (props.onClick) {
					props.onClick(e)
				}
				analytics.track(`Button-${trackingId}`, trackProperties)
			}}
			className={clsx(props.className, styles.buttonBase, {
				[styles.iconButton]: iconButton,
				[styles.small]: small,
				[styles.link]: props.type === 'link',
				[styles.pulse]: props.pulse,
			})}
			target={props.type === 'text' && props.href ? '_blank' : undefined}
		>
			{children}
		</AntDesignButton>
	)
}

export default Button
