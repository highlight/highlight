import { useAuthContext } from '@authentication/AuthContext'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { showIntercom } from '@util/window'
import React from 'react'
import { FiTwitter } from 'react-icons/fi'

import SvgBookIcon from '../../../static/BookIcon'
import SvgEditIcon from '../../../static/EditIcon'
import SvgHelpCircleIcon from '../../../static/HelpCircleIcon'
import SvgMessageIcon from '../../../static/MessageIcon'
import PopoverListContent from '../../Popover/PopoverListContent'
import PopoverMenu, { PopoverMenuItem } from '../../PopoverMenu/PopoverMenu'
import popoverMenuStyles from '../../PopoverMenu/PopoverMenu.module.scss'
import styles from './HelpMenu.module.scss'

const HelpMenu = () => {
	const { admin } = useAuthContext()

	const leadMenuItems: PopoverMenuItem[] = [
		...(!isOnPrem
			? [
					{
						icon: <SvgMessageIcon />,
						displayName: 'Send us a message',
						action: () => showIntercom({ admin }),
					},
			  ]
			: []),
	]

	const endMenuItems: PopoverMenuItem[] = [
		{
			icon: <SvgBookIcon />,
			displayName: 'Documentation',
			link: 'https://docs.highlight.run',
		},
		{
			icon: <SvgEditIcon />,
			displayName: 'Changelog',
			link: 'https://feedback.highlight.run/changelog',
		},
		{
			icon: <FiTwitter />,
			displayName: 'Twitter',
			link: 'https://twitter.com/highlightrun',
		},
	]

	return (
		<PopoverMenu
			content={
				<>
					<PopoverListContent
						small
						className={popoverMenuStyles.popoverMenuList}
						listItems={leadMenuItems.map((menuItem, index) => (
							<PopoverMenuItem {...menuItem} key={index} />
						))}
					/>
					<hr className={styles.divider} />
					<PopoverListContent
						small
						className={popoverMenuStyles.popoverMenuList}
						listItems={endMenuItems.map((menuItem, index) => (
							<PopoverMenuItem {...menuItem} key={index} />
						))}
					/>
				</>
			}
			buttonTrackingId="HelpMenu"
			buttonIcon={<SvgHelpCircleIcon />}
		></PopoverMenu>
	)
}

export default HelpMenu
