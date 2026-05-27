import { Popover as UiPopover } from '@highlight-run/ui/components'
import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'
import React from 'react'

import styles from './Popover.module.css'

export type PopoverProps = {
	arrowContent?: React.ReactNode
	showArrow?: boolean
	content?: React.ReactNode | (() => React.ReactNode)
	title?: React.ReactNode | (() => React.ReactNode)
	trigger?: 'hover' | 'focus' | 'click' | 'contextMenu'
	defaultVisible?: boolean
	onVisibleChange?: (visible: boolean) => void
	placement?: string
	align?: object
	visible?: boolean
	destroyTooltipOnHide?: boolean
	getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement
	overlayClassName?: string
	isList?: boolean
	popoverClassName?: string
	large?: boolean
	contentContainerClassName?: string
	onMouseEnter?: React.MouseEventHandler<HTMLDivElement> | undefined
	onMouseLeave?: React.MouseEventHandler<HTMLDivElement> | undefined
}

/**
 * A proxy for the UI package's popover. This component should be used instead of directly using the UI package's.
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
	content,
	visible,
	onVisibleChange,
	trigger = 'hover',
	...props
}) => {
	return (
		<UiPopover
			placement="bottom"
		>
			<UiPopover.BoxTrigger
				className={popoverClassName}
			>
				{children as React.ReactNode}
			</UiPopover.BoxTrigger>
			<Ariakit.Popover
				className={clsx(styles.popover, popoverClassName)}
				portal
			>
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
						{typeof content === 'function'
							? content()
							: content}
					</div>
				</div>
			</Ariakit.Popover>
		</UiPopover>
	)
}

export default Popover
