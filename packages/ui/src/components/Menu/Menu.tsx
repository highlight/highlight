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
		styles.ButtonVariants &
		Omit<MenuButtonProps, 'state'>
> = ({ children, size, kind, emphasis, cssClass, ...props }) => {
	const menu = useMenu()

	return (
		<MenuButton
			state={menu}
			className={clsx(
				styles.buttonVariants({
					kind,
					size,
					emphasis,
				}),
				cssClass,
			)}
			{...props}
		>
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
