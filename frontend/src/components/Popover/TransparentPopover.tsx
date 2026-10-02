import * as Ariakit from '@ariakit/react'
import React from 'react'

import styles from './TransparentPopover.module.css'

type Placement =
	| 'top'
	| 'topLeft'
	| 'topRight'
	| 'bottom'
	| 'bottomLeft'
	| 'bottomRight'
	| 'left'
	| 'leftTop'
	| 'leftBottom'
	| 'right'
	| 'rightTop'
	| 'rightBottom'

const mapPlacement = (
	placement?: Placement,
): Ariakit.PopoverProviderProps['placement'] => {
	if (!placement) return 'bottom'
	const map: Record<Placement, Ariakit.PopoverProviderProps['placement']> = {
		top: 'top',
		topLeft: 'top-start',
		topRight: 'top-end',
		bottom: 'bottom',
		bottomLeft: 'bottom-start',
		bottomRight: 'bottom-end',
		left: 'left',
		leftTop: 'left-start',
		leftBottom: 'left-end',
		right: 'right',
		rightTop: 'right-start',
		rightBottom: 'right-end',
	}
	return map[placement] ?? 'bottom'
}

type TransparentPopoverProps = {
	content?: React.ReactNode | (() => React.ReactNode)
	title?: React.ReactNode | (() => React.ReactNode)
	trigger?: 'click' | 'hover' | 'focus' | 'contextMenu'
	visible?: boolean
	onVisibleChange?: (visible: boolean) => void
	placement?: Placement
	defaultVisible?: boolean
	children?: React.ReactNode
}

/**
 * A transparent popover container with no border or background styling.
 * Replacing antd TransparentPopover.
 */
const TransparentPopover: React.FC<
	React.PropsWithChildren<TransparentPopoverProps>
> = ({
	children,
	content,
	visible,
	onVisibleChange,
	placement,
	defaultVisible,
}) => {
	const store = Ariakit.usePopoverStore({
		open: visible,
		setOpen: onVisibleChange,
		defaultOpen: defaultVisible,
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
				className={styles.popover}
				unmountOnHide
			>
				<Ariakit.PopoverArrow size={0} />
				{typeof content === 'function' ? content() : content}
			</Ariakit.Popover>
		</Ariakit.PopoverProvider>
	)
}

export default TransparentPopover
