'use client'

import styles from './button.module.css'
import classnames from 'classnames'

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
