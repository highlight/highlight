import analytics from '@util/analytics'
import clsx from 'clsx'
import React from 'react'

import styles from './Switch.module.css'

type Props = {
	checked?: boolean
	onChange?: (checked: boolean, event: React.MouseEvent) => void
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
	checked = false,
	disabled,
	loading,
	onChange,
	red,
	size = 'small',
}: Props) => {
	const labelToRender = !!label ? <span>{label}</span> : null
	const isDisabled = disabled || loading
	const handleChange = (event: React.MouseEvent) => {
		if (isDisabled) {
			event.preventDefault()
			return
		}

		const nextChecked = !checked
		if (onChange) {
			analytics.track(`Switch-${trackingId}`, {
				checked: nextChecked,
			})
			onChange(nextChecked, event)
		}
	}

	return (
		<label
			className={clsx(styles.label, className, {
				[styles.checked]: checked,
				[styles.spaceBetween]: justifySpaceBetween,
				[styles.noMarginAroundSwitch]: noMarginAroundSwitch,
				[styles.setMarginForAnimation]: setMarginForAnimation,
				[styles.red]: red,
			})}
		>
			{labelFirst && labelToRender}
			<span
				role="switch"
				aria-checked={checked}
				aria-disabled={isDisabled}
				tabIndex={isDisabled ? -1 : 0}
				className={clsx(
					styles.switchStyles,
					size === 'default' ? styles.defaultSize : styles.smallSize,
					{
						[styles.checked]: checked,
						[styles.disabled]: disabled,
						[styles.loading]: loading,
						[styles.red]: red,
					},
				)}
				onClick={handleChange}
				onKeyDown={(event) => {
					if (event.key !== 'Enter' && event.key !== ' ') {
						return
					}

					event.preventDefault()
					handleChange(event as unknown as React.MouseEvent)
				}}
			>
				<span className={styles.handle} />
			</span>
			{!labelFirst && labelToRender}
		</label>
	)
}

export default Switch
