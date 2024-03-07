import { Menu as AntDesignMenu, MenuItemProps } from 'antd'
import clsx from 'clsx'

import styles from './MenuItem.module.css'

type Props = {} & Pick<
	MenuItemProps,
	'onClick' | 'children' | 'className' | 'icon'
>

const MenuItem = ({ children, className, ...props }: Props) => {
	return (
		<AntDesignMenu.Item
			{...props}
			className={clsx(styles.menuItem, className)}
		>
			{children}
		</AntDesignMenu.Item>
	)
}

export default MenuItem
