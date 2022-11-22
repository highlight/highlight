import {
	MenuButton,
	MenuItem,
	MenuItemProps,
	Menu as AriakitMenu,
	MenuSeparator,
	MenuSeparatorProps,
	MenuState,
	useMenuState,
	MenuProps,
	MenuButtonProps,
} from 'ariakit'
import React, { useContext } from 'react'
import { Box } from '../Box/Box'
import { IconProps } from '../icons'

import * as styles from './styles.css'

const MenuContext = React.createContext<MenuState>({} as MenuState)
const useMenu = () => useContext(MenuContext)

type Props = React.PropsWithChildren

type MenuComponent = React.FC<Props> & {
	Button: typeof Button
	List: typeof List
	Item: typeof Item
	Divider: typeof Divider
}

export const Menu: MenuComponent = ({ children }: Props) => {
	const menu = useMenuState({ gutter: 6 })

	return <MenuContext.Provider value={menu}>{children}</MenuContext.Provider>
}

const Button: React.FC<
	React.PropsWithChildren &
		styles.ButtonVariants &
		Omit<MenuButtonProps, 'state'>
> = ({ children, size, kind, emphasis, ...props }) => {
	const menu = useMenu()

	return (
		<MenuButton
			state={menu}
			className={styles.buttonVariants({
				kind,
				size,
				emphasis,
			})}
			{...props}
		>
			{children}
		</MenuButton>
	)
}

const List: React.FC<React.PropsWithChildren & Partial<MenuProps>> = ({
	children,
}) => {
	const menu = useMenu()

	return (
		<AriakitMenu state={menu} className={styles.menuList}>
			{children}
		</AriakitMenu>
	)
}

const Item: React.FC<MenuItemProps> = ({ children, ...props }) => (
	<MenuItem
		className={styles.menuItemVariants({ selected: false })}
		{...props}
	>
		{children}
	</MenuItem>
)

const Divider: React.FC<MenuSeparatorProps> = ({ children, ...props }) => (
	<MenuSeparator className={styles.menuDivider} {...props}>
		{children}
	</MenuSeparator>
)

Menu.Button = Button
Menu.List = List
Menu.Item = Item
Menu.Divider = Divider
