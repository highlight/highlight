import * as Ariakit from '@ariakit/react'
import React from 'react'

import styles from './PopConfirm.module.css'

type Placement =
	| 'top'
	| 'topLeft'
	| 'topRight'
	| 'bottom'
	| 'bottomLeft'
	| 'bottomRight'
	| 'left'
	| 'right'

const mapPlacement = (
	placement?: Placement,
): Ariakit.PopoverProviderProps['placement'] => {
	if (!placement) return 'top'
	const map: Record<Placement, Ariakit.PopoverProviderProps['placement']> = {
		top: 'top',
		topLeft: 'top-start',
		topRight: 'top-end',
		bottom: 'bottom',
		bottomLeft: 'bottom-start',
		bottomRight: 'bottom-end',
		left: 'left',
		right: 'right',
	}
	return map[placement] ?? 'top'
}

type Props = {
	title: string
	description: string
	onConfirm?: React.MouseEventHandler<HTMLButtonElement>
	onCancel?: React.MouseEventHandler<HTMLButtonElement>
	okText?: string
	cancelText?: string
	placement?: Placement
	visible?: boolean
	children?: React.ReactNode
}

const PopConfirm = ({
	children,
	title,
	description,
	onConfirm,
	onCancel,
	okText = 'OK',
	cancelText = 'Cancel',
	placement,
	visible,
}: Props) => {
	const store = Ariakit.usePopoverStore({
		open: visible,
		placement: mapPlacement(placement),
	})

	return (
		<Ariakit.PopoverProvider store={store}>
			<Ariakit.PopoverDisclosure store={store} render={<span />}>
				{children}
			</Ariakit.PopoverDisclosure>
			<Ariakit.Popover
				store={store}
				gutter={4}
				className={styles.popConfirmContainer}
			>
				<Ariakit.PopoverArrow size={0} />
				<h4>{title}</h4>
				<p className={styles.description}>{description}</p>
				<div className={styles.buttons}>
					<button
						className={styles.cancelButton}
						onClick={(e) => {
							onCancel?.(e)
							store.hide()
						}}
					>
						{cancelText}
					</button>
					<button
						className={styles.okButton}
						onClick={(e) => {
							onConfirm?.(e)
							store.hide()
						}}
					>
						{okText}
					</button>
				</div>
			</Ariakit.Popover>
		</Ariakit.PopoverProvider>
	)
}

export default PopConfirm
