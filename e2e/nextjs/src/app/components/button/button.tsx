'use client'

import classnames from 'classnames'
import styles from './button.module.css'

type Props = React.ComponentPropsWithoutRef<'button'>

export function Button({ className, ...props }: Props) {
	return (
		<button
			className={classnames(
				styles.genericButton,
				styles.primaryButton,
				className,
			)}
			{...props}
		/>
	)
}
