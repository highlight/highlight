import { Modal as HLModal } from '@highlight-run/ui/components'
import clsx from 'clsx'
import React from 'react'

import styles from './Modal.module.css'

type Props = {
	visible?: boolean
	onCancel?: () => void
	width?: number | string
	title?: React.ReactNode
	minimal?: boolean
	minimalPaddingSize?: string
	className?: string
	style?: React.CSSProperties
	destroyOnClose?: boolean
	children?: React.ReactNode
	// Legacy props accepted but unused (kept for call-site compatibility)
	centered?: boolean
	mask?: boolean
	maskStyle?: React.CSSProperties
	getContainer?: string | HTMLElement | (() => HTMLElement) | false
	forceRender?: boolean
	modalRender?: (node: React.ReactNode) => React.ReactNode
}

const Modal: React.FC<Props> = ({
	children,
	className,
	title,
	minimal,
	minimalPaddingSize = 'var(--size-xSmall)',
	visible,
	onCancel,
	width = 480,
	destroyOnClose,
	style,
}) => {
	const numericWidth =
		typeof width === 'string' ? parseInt(width) || 480 : width

	const bodyStyle: React.CSSProperties = minimal
		? {
				paddingTop: minimalPaddingSize,
				paddingBottom: minimalPaddingSize,
				paddingLeft: minimalPaddingSize,
				paddingRight: minimalPaddingSize,
			}
		: {}

	return (
		<HLModal
			open={visible}
			setOpen={(open) => {
				if (!open) onCancel?.()
			}}
			width={numericWidth}
			unmountOnHide={destroyOnClose}
		>
			{title &&
				(minimal ? (
					<div style={{ padding: minimalPaddingSize }}>{title}</div>
				) : (
					<HLModal.Header>{title}</HLModal.Header>
				))}
			<main
				className={clsx(styles.modalContent, className)}
				style={{ ...bodyStyle, ...style }}
			>
				{children}
			</main>
		</HLModal>
	)
}

export default Modal
