import { Popover as UiPopover } from '@highlight-run/ui/components'
import * as Ariakit from '@ariakit/react'
import React from 'react'

import styles from './TransparentPopover.module.css'

type TransparentPopoverProps = {
	content?: React.ReactNode | (() => React.ReactNode)
	title?: React.ReactNode | (() => React.ReactNode)
	trigger?: 'hover' | 'focus' | 'click' | 'contextMenu'
	defaultVisible?: boolean
	onVisibleChange?: (visible: boolean) => void
	placement?: string
	align?: object
	visible?: boolean
	getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement
}

/**
 * A proxy for the UI package's popover. This component should be used instead of directly using the UI package's.
 * This is different than Popover as the container does not have any styles.
 */
const TransparentPopover: React.FC<
	React.PropsWithChildren<TransparentPopoverProps>
> = ({ children, ...props }) => {
	return (
		<UiPopover placement="bottom">
			<UiPopover.BoxTrigger>
				{children as React.ReactNode}
			</UiPopover.BoxTrigger>
			<Ariakit.Popover
				className={styles.popover}
				portal
			>
				{typeof props.content === 'function'
					? props.content()
					: props.content}
			</Ariakit.Popover>
		</UiPopover>
	)
}

export default TransparentPopover
