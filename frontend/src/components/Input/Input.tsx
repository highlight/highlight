import clsx from 'clsx'
import React from 'react'

import styles from './Input.module.css'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
	ref?: React.Ref<HTMLInputElement>
	prefix?: React.ReactNode
	suffix?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, Props>(
	({ className, prefix, suffix, ...props }, ref) => {
		if (prefix || suffix) {
			return (
				<div className={clsx(styles.wrapper, className)}>
					{prefix && (
						<span className={styles.adornment}>{prefix}</span>
					)}
					<input ref={ref} {...props} className={styles.innerInput} />
					{suffix && (
						<span className={styles.adornment}>{suffix}</span>
					)}
				</div>
			)
		}

		return (
			<input
				ref={ref}
				{...props}
				className={clsx(styles.input, className)}
			/>
		)
	},
)

Input.displayName = 'Input'

export default Input
