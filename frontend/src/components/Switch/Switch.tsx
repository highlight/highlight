// eslint-disable-next-line no-restricted-imports
import analytics from '@util/analytics'
import clsx from 'clsx'
import React from 'react'

import styles from './Switch.module.css'

type Props = {
	checked?: boolean
	onChange?: (
		checked: boolean,
		event: React.ChangeEvent<HTMLInputElement>,
	) => void
	loading?: boolean
	className?: string
	size?: 'small' | 'default'
	disabled?: boolean
	label?: string | React.ReactNode
	/** Renders the label before the switch. */
	labelFirst?: boolean
	/** Renders the label and the switch with space-between. */
	justifySpaceBetween?: boolean
	noMarginAroundSwitch?: boolean
	setMarginForAnimation?: boolean
	trackingId: string
	red?: boolean
}

const Switch = ({
	label,
	labelFirst,
	justifySpaceBetween,
	noMarginAroundSwitch,
	setMarginForAnimation,
	className,
	trackingId,
	...props
}: Props) => {
	const labelToRender = !!label ? <span>{label}</span> : null
	return (
		<label
			className={clsx(styles.label, className, {
				[styles.checked]: props.checked,
				[styles.spaceBetween]: justifySpaceBetween,
				[styles.noMarginAroundSwitch]: noMarginAroundSwitch,
				[styles.setMarginForAnimation]: setMarginForAnimation,
				[styles.red]: props.red,
			})}
		>
			{labelFirst && labelToRender}
			<input
				type="checkbox"
				role="switch"
				checked={props.checked}
				disabled={props.loading || props.disabled}
				className={clsx(styles.switchStyles, {
					[styles.red]: props.red,
				})}
				onChange={(event) => {
					if (props.onChange) {
						analytics.track(`Switch-${trackingId}`, {
							checked: event.target.checked,
						})
						props.onChange(event.target.checked, event)
					}
				}}
			/>
			{!labelFirst && labelToRender}
		</label>
	)
}

export default Switch
