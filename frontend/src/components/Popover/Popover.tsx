import {
	// Disabling here because we are using this file as a proxy.
	// eslint-disable-next-line no-restricted-imports
	Popover as AntDesignPopover,
	PopoverProps as AntDesignPopoverProps,
} from 'antd'
import classNames from 'classnames'
import React from 'react'

import styles from './Popover.module.scss'

type PopoverProps = Pick<
	AntDesignPopoverProps,
	| 'arrowContent'
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
const Popover: React.FC<PopoverProps> = ({
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
			overlayClassName={classNames(styles.popover, popoverClassName)}
			{...props}
			content={
				<div
					className={classNames(
						{
							[styles.contentContainer]: !isList,
							[styles.large]: large,
						},
						contentContainerClassName,
					)}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
				>
					{title}
					<div className={styles.content}>{props.content}</div>
				</div>
			}
		>
			{children}
		</AntDesignPopover>
	)
}

export default Popover
