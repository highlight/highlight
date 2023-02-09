import { PopoverProps } from 'antd'
import clsx from 'clsx'
import React from 'react'

import Button from '../Button/Button/Button'
import Popover from '../Popover/Popover'
import PopoverListContent from '../Popover/PopoverListContent'
import styles from './PopoverMenu.module.scss'

type Props = {
	/** The contents of the popover. This is used if you want to control what content is rendered in the Popover. If the content is not a list then you should use `Popover` instead. */
	content?: React.ReactNode
	/** The menu items for the popover. */
	menuItems?: PopoverMenuItem[]
	buttonTrackingId: string
	/** The child of the button that opens the popover. */
	buttonIcon?: React.ReactNode
	buttonContentsOverride?: React.ReactNode
	header?: React.ReactNode
} & Pick<PopoverProps, 'placement' | 'getPopupContainer'>

const PopoverMenu = ({
	content,
	menuItems,
	buttonTrackingId,
	buttonIcon: buttonContents,
	buttonContentsOverride,
	header,
	placement,
	getPopupContainer,
}: Props) => {
	if (!content && !menuItems) {
		throw new Error('content or menuItems need to be defined.')
	}
	if (content && menuItems) {
		throw new Error('content and menuItems cannot be both defined.')
	}

	return (
		<Popover
			isList
			trigger={['click']}
			popoverClassName={styles.popover}
			placement={placement}
			getPopupContainer={getPopupContainer}
			content={
				content ? (
					content
				) : (
					<>
						<PopoverListContent
							small
							className={styles.popoverMenuList}
							listItems={(menuItems || [])
								.filter((menuItem) => menuItem.hidden !== true)
								.map((menuItem, index) => (
									<PopoverMenuItem
										{...menuItem}
										key={index}
									/>
								))}
						/>
					</>
				)
			}
			title={header && <div className={styles.header}>{header}</div>}
		>
			{buttonContentsOverride || (
				<Button type="text" trackingId={buttonTrackingId} iconButton>
					{buttonContents}
				</Button>
			)}
		</Popover>
	)
}

export default PopoverMenu

export interface PopoverMenuItem {
	icon?: React.ReactNode
	iconPosition?: 'leading' | 'ending'
	displayName: string | React.ReactNode
	link?: string
	action?: () => void
	active?: boolean
	hidden?: boolean
}

export const PopoverMenuItem = ({
	icon,
	displayName,
	action,
	link,
	iconPosition = 'leading',
	active,
}: PopoverMenuItem) => {
	if (action && link) {
		throw new Error(
			'Cannot set both action and link. A HelpMenuItem can only have either action or link.',
		)
	}

	if (action) {
		return (
			<Button
				onClick={action}
				trackingId={`HelpMenu-${displayName}`}
				type={active ? 'primary' : 'text'}
				className={clsx(styles.button, {
					[styles.active]: active,
				})}
			>
				{iconPosition === 'leading' && icon}
				{displayName}
				{iconPosition === 'ending' && (
					<div className={styles.endingIcon}>{icon}</div>
				)}
			</Button>
		)
	}

	if (link) {
		return (
			<a href={link} target="_blank" rel="noreferrer">
				{icon}
				{displayName}
			</a>
		)
	}

	throw new Error('`action` or `link` needs to be defined.')
}
