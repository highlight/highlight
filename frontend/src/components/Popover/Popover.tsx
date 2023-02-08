import {
	Popover as AntDesignPopover,
	PopoverProps as AntDesignPopoverProps,
} from 'antd'
import React from 'react'

import styles from './Popover.module.scss'

export type PopoverProps = Pick<
	AntDesignPopoverProps,
	| 'arrowContent'
	| 'showArrow'
	| 'content'
	| 'title'
	| 'trigger'
	| 'defaultVisible'
	| 'onVisibleChange'
	| 'placement'
	| 'align'
	| 'visible'
	| 'destroyTooltipOnHide'
	| 'getPopupContainer'
	| 'overlayClassName'
> & {
	isList?: boolean
	popoverClassName?: string
	large?: boolean
	contentContainerClassName?: string
	onMouseEnter?: React.MouseEventHandler<HTMLDivElement> | undefined
	onMouseLeave?: React.MouseEventHandler<HTMLDivElement> | undefined
}

/**
 * A proxy for Ant Design's popover. This component should be used instead of directly using Ant Design's.
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
	...props
}) => {
	return (
		<AntDesignPopover
			overlayClassName={clsx(styles.popover, popoverClassName)}
			{...props}
			content={
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
						{typeof props.content === 'function'
							? props.content()
							: props.content}
					</div>
				</div>
			}
		>
			{children}
		</AntDesignPopover>
	)
}

export default Popover
