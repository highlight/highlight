import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'
import React from 'react'

import styles from './Popover.module.css'

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

// Maps antd placement strings to Ariakit/floating-ui placement strings
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

export type PopoverProps = {
	content?: React.ReactNode | (() => React.ReactNode)
	title?: React.ReactNode | (() => React.ReactNode)
	trigger?: 'click' | 'hover' | 'focus' | 'contextMenu'
	visible?: boolean
	onVisibleChange?: (visible: boolean) => void
	placement?: Placement
	defaultVisible?: boolean
	isList?: boolean
	popoverClassName?: string
	large?: boolean
	contentContainerClassName?: string
	onMouseEnter?: React.MouseEventHandler<HTMLDivElement>
	onMouseLeave?: React.MouseEventHandler<HTMLDivElement>
	overlayClassName?: string
	destroyTooltipOnHide?: boolean
	className?: string
	children?: React.ReactNode
}

/**
 * Popover component using Ariakit, replacing antd Popover.
 */
const Popover: React.FC<React.PropsWithChildren<PopoverProps>> = ({
	children,
	title,
	isList,
	popoverClassName,
	contentContainerClassName,
	large = false,
	onMouseEnter,
	onMouseLeave,
	visible,
	onVisibleChange,
	placement,
	defaultVisible,
	trigger = 'click',
	content,
	overlayClassName,
}) => {
	const store = Ariakit.usePopoverStore({
		open: visible,
		setOpen: onVisibleChange,
		defaultOpen: defaultVisible,
		placement: mapPlacement(placement),
	})

	const isHover = trigger === 'hover'

	const contentNode = (
		<div
			className={clsx(
				{
					[styles.contentContainer]: !isList,
					[styles.large]: large,
				},
				contentContainerClassName,
			)}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			{typeof title === 'function' ? title() : title}
			<div className={styles.content}>
				{typeof content === 'function' ? content() : content}
			</div>
		</div>
	)

	if (isHover) {
		return (
			<Ariakit.PopoverProvider store={store}>
				<Ariakit.PopoverAnchor
					store={store}
					onMouseEnter={() => store.show()}
					onMouseLeave={() => store.hide()}
				>
					{children}
				</Ariakit.PopoverAnchor>
				<Ariakit.Popover
					store={store}
					gutter={4}
					className={clsx(
						styles.popover,
						popoverClassName,
						overlayClassName,
					)}
					hideOnHoverOutside={false}
				>
					<Ariakit.PopoverArrow size={0} />
					{contentNode}
				</Ariakit.Popover>
			</Ariakit.PopoverProvider>
		)
	}

	return (
		<Ariakit.PopoverProvider store={store}>
			<Ariakit.PopoverDisclosure store={store} render={<span />}>
				{children}
			</Ariakit.PopoverDisclosure>
			<Ariakit.Popover
				store={store}
				gutter={4}
				className={clsx(
					styles.popover,
					popoverClassName,
					overlayClassName,
				)}
			>
				<Ariakit.PopoverArrow size={0} />
				{contentNode}
			</Ariakit.Popover>
		</Ariakit.PopoverProvider>
	)
}

export default Popover
