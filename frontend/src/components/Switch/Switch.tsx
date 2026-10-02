import { Checkbox, useCheckboxStore } from '@ariakit/react'
import analytics from '@util/analytics'
import clsx from 'clsx'
import React from 'react'

import styles from './Switch.module.css'

type Props = {
	checked?: boolean
	onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void
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
	size = 'small',
	...props
}: Props) => {
	const checkbox = useCheckboxStore({
		checked: props.checked,
		setValue: (value) => {
			if (props.onChange && !props.disabled && !props.loading) {
				analytics.track(`Switch-${trackingId}`, {
					checked: !!value,
				})
				props.onChange(!!value, {} as React.ChangeEvent<HTMLInputElement>)
			}
		},
	})

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
			<Checkbox
				store={checkbox}
				className={clsx(styles.switchStyles, {
					[styles.checked]: props.checked,
					[styles.red]: props.red,
					[styles.small]: size === 'small',
				})}
				disabled={props.disabled || props.loading}
			/>
			{!labelFirst && labelToRender}
		</label>
	)
}

export default Switch
