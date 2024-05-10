import classNames from 'classnames'
import React from 'react'

import styles from './Buttons.module.scss'

export type ButtonProps = React.DetailedHTMLProps<
	React.AnchorHTMLAttributes<HTMLAnchorElement>,
	HTMLAnchorElement
>

export const PrimaryButton = ({
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
				styles.primaryButton,
			)}
		>
			{children}
		</a>
	)
}
