import clsx from 'clsx'
import React, { HTMLProps } from 'react'

import styles from './ModalBody.module.scss'

/** ModalBody is used as a direct child from Modal. */
const ModalBody: React.FC<
	React.PropsWithChildren<HTMLProps<HTMLDivElement>>
> = ({ children, ...props }) => {
	return (
		<div {...props} className={clsx(styles.modalBody, props.className)}>
			{children}
		</div>
	)
}

export default ModalBody
