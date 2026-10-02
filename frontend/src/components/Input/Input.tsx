import clsx from 'clsx'
import React from 'react'

import styles from './Input.module.css'

type Props = {
	className?: string
	value?: string
	defaultValue?: string
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
	placeholder?: string
	autoFocus?: boolean
	autoComplete?: string
	disabled?: boolean
	name?: string
	type?: string
	pattern?: string
	required?: boolean
	ref?: React.Ref<HTMLInputElement>
	id?: string
	size?: 'small' | 'middle' | 'large'
	onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
	onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
	onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
	prefix?: React.ReactNode
	suffix?: React.ReactNode
	allowClear?: boolean
	addonBefore?: React.ReactNode
	addonAfter?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, Props>(
	({ className, prefix, suffix, allowClear, addonBefore, addonAfter, size, ...props }, ref) => {
		return (
			<div className={clsx(styles.inputWrapper, className, {
				[styles.small]: size === 'small',
				[styles.large]: size === 'large',
			})}>
				{addonBefore && <span className={styles.addon}>{addonBefore}</span>}
				{prefix && <span className={styles.affix}>{prefix}</span>}
				<input
					ref={ref}
					className={clsx(styles.input, className)}
					{...props}
				/>
				{allowClear && props.value && (
					<button
						className={styles.clearButton}
						onClick={() => props.onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
						type="button"
					>
						×
					</button>
				)}
				{suffix && <span className={styles.affix}>{suffix}</span>}
				{addonAfter && <span className={styles.addon}>{addonAfter}</span>}
			</div>
		)
	},
)

export default Input
