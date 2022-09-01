import classNames from 'classnames'
import React, { HTMLProps } from 'react'

import styles from './ModalBody.module.scss'

/** ModalBody is used as a direct child from Modal. */
const ModalBody: React.FC<
	React.PropsWithChildren<React.PropsWithChildren<HTMLProps<HTMLDivElement>>>
> = ({ children, ...props }) => {
	return (
		<div
			{...props}
			className={classNames(styles.modalBody, props.className)}
		>
			{children}
		</div>
	)
}

export default ModalBody
