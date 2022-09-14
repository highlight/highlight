import { Menu as AntDesignMenu, MenuItemProps } from 'antd'
import classNames from 'classnames'
import React from 'react'

import styles from './MenuItem.module.scss'

type Props = {} & Pick<
	MenuItemProps,
	'onClick' | 'children' | 'className' | 'icon'
>

const MenuItem = ({ children, className, ...props }: Props) => {
	return (
		<AntDesignMenu.Item
			{...props}
			className={classNames(styles.menuItem, className)}
		>
			{children}
		</AntDesignMenu.Item>
	)
}

export default MenuItem
