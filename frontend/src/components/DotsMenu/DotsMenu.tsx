import analytics from '@util/analytics'
import { Dropdown, DropDownProps } from 'antd'
import React from 'react'

import SvgDotsHorizontalIcon from '../../static/DotsHorizontalIcon'
import styles from './DotsMenu.module.scss'

type Props = {
	/**
	 * The menu options.
	 * <Menu>
	 *  <MenuItem>
	 *  <MenuItem>
	 * </Menu>
	 */
	menu: JSX.Element
	/** The trackingId for opening the menu. */
	trackingId: string
	/** Override the default ellipsis icon (...) */
	icon?: React.ReactNode
} & Pick<DropDownProps, 'placement'>

const DotsMenu = ({
	menu,
	trackingId,
	placement,
	icon = <SvgDotsHorizontalIcon />,
}: Props) => {
	return (
		<Dropdown
			overlay={menu}
			trigger={['click']}
			placement={placement}
			overlayClassName={styles.dropdown}
		>
			<button
				className={styles.button}
				onClick={() => {
					analytics.track(trackingId)
				}}
			>
				{icon}
			</button>
		</Dropdown>
	)
}

export default DotsMenu
