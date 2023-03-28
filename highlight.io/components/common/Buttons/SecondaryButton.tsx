import React from 'react'
import { ButtonProps } from 'antd'
import classNames from 'classnames'
import { BiRightArrowAlt } from 'react-icons/bi'
import styles from './Buttons.module.scss'

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
