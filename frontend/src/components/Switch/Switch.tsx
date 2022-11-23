// eslint-disable-next-line no-restricted-imports
import analytics from '@util/analytics'
import { Switch as AntDesignSwitch, SwitchProps } from 'antd'
import classNames from 'classnames'
import React from 'react'

import styles from './Switch.module.scss'

type Props = Pick<
	SwitchProps,
	'checked' | 'onChange' | 'loading' | 'className' | 'size' | 'disabled'
> & {
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
	const labelToRender = !!label ? <span>{label}</span> : null
	return (
		<label
			className={classNames(styles.label, className, {
				[styles.checked]: props.checked,
				[styles.spaceBetween]: justifySpaceBetween,
				[styles.noMarginAroundSwitch]: noMarginAroundSwitch,
				[styles.setMarginForAnimation]: setMarginForAnimation,
				[styles.red]: props.red,
			})}
		>
			{labelFirst && labelToRender}
			<AntDesignSwitch
				{...props}
				size={size}
				className={classNames(styles.switchStyles, {
					[styles.red]: props.red,
				})}
				onChange={(checked, event) => {
					if (props.onChange) {
						analytics.track(`Switch-${trackingId}`, {
							checked,
						})
						props.onChange(checked, event)
					}
				}}
			/>
			{!labelFirst && labelToRender}
		</label>
	)
}

export default Switch
