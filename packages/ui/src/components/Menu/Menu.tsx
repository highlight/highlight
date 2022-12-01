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
import clsx, { ClassValue } from 'clsx'
import React, { useContext } from 'react'
import { Box } from '../Box/Box'
import {
	Button as OriginalButton,
	Props as ButtonProps,
} from '../Button/Button'

import * as buttonStyles from '../Button/styles.css'
import * as styles from './styles.css'

const MenuContext = React.createContext<MenuState>({} as MenuState)
const useMenu = () => useContext(MenuContext)

type Props = React.PropsWithChildren<Partial<MenuState>>

type MenuComponent = React.FC<Props> & {
	Button: typeof Button
	List: typeof List
	Item: typeof Item
	Divider: typeof Divider
}

export const Menu: MenuComponent = ({ children, ...props }: Props) => {
	const menu = useMenuState({ gutter: 6, ...props })

	return <MenuContext.Provider value={menu}>{children}</MenuContext.Provider>
}

const Button: React.FC<
	React.PropsWithChildren<{ cssClass?: ClassValue | ClassValue[] }> &
		buttonStyles.Variants &
		Omit<MenuButtonProps, 'state'> &
		Pick<ButtonProps, 'iconLeft' | 'iconRight'>
> = ({ children, ...props }) => {
	const menu = useMenu()

	return (
		<MenuButton as={OriginalButton} state={menu} {...props}>
			{children}
		</MenuButton>
	)
}

const List: React.FC<
	React.PropsWithChildren<{ cssClass?: ClassValue | ClassValue[] }> &
		Partial<MenuProps>
> = ({ children, cssClass }) => {
	const menu = useMenu()

	return (
		<AriakitMenu state={menu} className={clsx([styles.menuList, cssClass])}>
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
