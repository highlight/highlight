import { Modal as UiModal } from '@highlight-run/ui/components'
import SvgCloseIcon from '@icons/CloseIcon'
import clsx from 'clsx'
import React from 'react'

import styles from './Modal.module.css'

type Props = {
	width?: number
	onCancel?: (e: React.MouseEvent<HTMLElement>) => void
	visible?: boolean
	style?: React.CSSProperties
	forceRender?: boolean
	modalRender?: (node: React.ReactNode) => React.ReactNode
	destroyOnClose?: boolean
	centered?: boolean
	mask?: boolean
	maskStyle?: React.CSSProperties
	getContainer?: string | HTMLElement | (() => HTMLElement)
	className?: string
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
	visible,
	onCancel,
	width = 520,
	centered,
	destroyOnClose,
	mask = true,
	maskStyle,
	style,
	forceRender,
	modalRender,
	getContainer,
	...rest
}) => {
	if (!visible) {
		return null
	}

	const bodyStyle: React.CSSProperties = minimal
		? {
				paddingTop: minimalPaddingSize,
				paddingBottom: minimalPaddingSize,
				paddingLeft: minimalPaddingSize,
				paddingRight: minimalPaddingSize,
			}
		: {}

	let content = (
		<>
			{title && (
				<UiModal.Header>
					<h3
						className={
							minimal ? 'm-0' : 'mb-4 mr-8'
						}
					>
						{title}
					</h3>
				</UiModal.Header>
			)}
			<UiModal.Body>
				<main
					className={styles.modalContent}
					style={bodyStyle}
				>
					{children}
				</main>
			</UiModal.Body>
		</>
	)

	if (modalRender) {
		content = modalRender(content) as React.ReactElement
	}

	return (
		<UiModal
			open={visible}
			onClose={onCancel ? () => onCancel({} as React.MouseEvent<HTMLElement>) : undefined}
			width={width}
			className={clsx(styles.modal, className)}
		>
			{content}
		</UiModal>
	)
}

export default Modal
