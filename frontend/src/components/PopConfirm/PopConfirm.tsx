import { Box, Button, Text } from '@highlight-run/ui/components'
import React, { useRef, useState } from 'react'

import styles from './PopConfirm.module.css'

type Props = {
	title: string
	description: string
	cancelText?: string
	okText?: string
	onConfirm?: () => void
	onCancel?: () => void
	placement?: string
	children: React.ReactNode
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
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	return (
		<div
			ref={ref}
			style={{ display: 'inline-block', position: 'relative' }}
		>
			<span
				onClick={() => setOpen((v) => !v)}
				style={{ cursor: 'pointer' }}
			>
				{children}
			</span>
			{open && (
				<Box
					className={styles.popConfirmContainer}
					position="absolute"
					borderRadius="6"
					border="secondary"
					p="8"
					style={{
						zIndex: 1000,
						top: '110%',
						left: 0,
						minWidth: 220,
						background: 'var(--color-white)',
						boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
					}}
				>
					<Text weight="bold" size="small">
						{title}
					</Text>
					<Text
						size="xSmall"
						color="n9"
						style={{ marginTop: 4, marginBottom: 12 }}
					>
						{description}
					</Text>
					<Box display="flex" gap="6" justifyContent="flex-end">
						<Button
							kind="secondary"
							size="small"
							onClick={() => {
								setOpen(false)
								onCancel?.()
							}}
						>
							{cancelText}
						</Button>
						<Button
							kind="primary"
							size="small"
							onClick={() => {
								setOpen(false)
								onConfirm?.()
							}}
						>
							{okText}
						</Button>
					</Box>
				</Box>
			)}
		</div>
	)
}

export default PopConfirm
