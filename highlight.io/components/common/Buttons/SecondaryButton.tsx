import classNames from 'classnames'
import React from 'react'
import styles from './Buttons.module.scss'
import { ButtonProps } from './PrimaryButton'

export const PrimaryLink = ({
	children,
	...props
}: React.PropsWithChildren<ButtonProps>) => {
	return (
		<a
			{...props}
			onClick={(e) => {
				if (props.onClick) {
					props.onClick(e)
				}
			}}
			className={classNames(
				props.className,
				styles.genericButton,
				styles.secondaryButton,
			)}
		>
			{children}
			<span className={styles.arrow}>→</span>
		</a>
	)
}
