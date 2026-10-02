import { Button, Popover as UiPopover } from '@highlight-run/ui/components'
import * as Ariakit from '@ariakit/react'
import React from 'react'

import styles from './PopConfirm.module.css'

type Props = {
	cancelText?: string
	okText?: string
	children: React.ReactNode
	onConfirm?: (e: React.MouseEvent<HTMLElement>) => void
	onCancel?: (e: React.MouseEvent<HTMLElement>) => void
	placement?: string
	align?: object
	visible?: boolean
	title: string
	description: string
}

const PopConfirm = ({
	children,
	title,
	description,
	cancelText = 'Cancel',
	okText = 'OK',
	onConfirm,
	onCancel,
}: Props) => {
	return (
		<UiPopover>
			<UiPopover.BoxTrigger>
				{children}
			</UiPopover.BoxTrigger>
			<Ariakit.Popover
				className={styles.popConfirmContainer}
				portal
			>
				<h4>{title}</h4>
				<p className={styles.description}>{description}</p>
				<div className={styles.buttonRow}>
					<Button
						kind="secondary"
						emphasis="high"
						size="xSmall"
						onClick={onCancel}
					>
						{cancelText}
					</Button>
					<Button
						kind="primary"
						emphasis="high"
						size="xSmall"
						onClick={onConfirm}
					>
						{okText}
					</Button>
				</div>
			</Ariakit.Popover>
		</UiPopover>
	)
}

export default PopConfirm
