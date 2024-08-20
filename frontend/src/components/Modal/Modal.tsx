// eslint-disable-next-line no-restricted-imports
import SvgCloseIcon from '@icons/CloseIcon'
import { Modal as AntDesignModal, ModalProps } from 'antd'
import clsx from 'clsx'
import React from 'react'

import styles from './Modal.module.css'

type Props = Pick<
	ModalProps,
	| 'width'
	| 'onCancel'
	| 'visible'
	| 'style'
	| 'forceRender'
	| 'modalRender'
	| 'destroyOnClose'
	| 'centered'
	| 'mask'
	| 'maskStyle'
	| 'getContainer'
	| 'className'
> & {
	title?: React.ReactNode
	minimal?: boolean
	minimalPaddingSize?: string
}

const Modal: React.FC<React.PropsWithChildren<Props>> = ({
	children,
	className,
	title,
	minimal,
	minimalPaddingSize = 'var(--size-xSmall)',
	...props
}) => {
	const bodyStyle: React.CSSProperties = minimal
		? {
				paddingTop: minimalPaddingSize,
				paddingBottom: minimalPaddingSize,
				paddingLeft: minimalPaddingSize,
				paddingRight: minimalPaddingSize,
			}
		: {}

	return (
		<AntDesignModal
			footer={null}
			{...props}
			closeIcon={
				!minimal ? <SvgCloseIcon height="18px" width="18px" /> : null
			}
			className={clsx(styles.modal, className)}
			wrapClassName={styles.modalWrap}
			closable={!minimal}
			bodyStyle={bodyStyle}
			maskClosable
		>
			{/* adding margin right to make room for the close button */}
			{title && (
				<h3 className={minimal ? 'm-0' : 'mb-4 mr-8'}>{title}</h3>
			)}
			<main className={styles.modalContent}>{children}</main>
		</AntDesignModal>
	)
}

export default Modal
