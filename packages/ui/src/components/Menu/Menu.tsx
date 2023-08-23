import {
	MenuButton,
	MenuItem,
	MenuItemProps,
	Menu as AriakitMenu,
	MenuSeparator,
	MenuSeparatorProps,
	MenuStoreProps,
	MenuStore,
	useMenuStore,
	MenuProps,
	MenuButtonProps as AriakitMenuButtonProps,
	MenuHeading as AriakitMenuHeading,
	MenuHeadingProps,
} from '@ariakit/react'
import clsx, { ClassValue } from 'clsx'
import React, { forwardRef } from 'react'
import {
	Button as OriginalButton,
	ButtonProps as ButtonProps,
} from '../Button/Button'

import { ButtonIcon, Props as ButtonIconProps } from '../ButtonIcon/ButtonIcon'
import * as styles from './styles.css'

const MenuContext = React.createContext<MenuStore>({} as MenuStore)
export const useMenu = () => React.useContext(MenuContext)

type Props = React.PropsWithChildren<Partial<MenuStoreProps>>

type MenuComponent = React.FC<Props> & {
	Button: typeof Button
	List: typeof List
	Item: typeof Item
	Divider: typeof Divider
	Heading: typeof Heading
}

export const Menu: MenuComponent = ({ children, ...props }: Props) => {
	const menu = useMenuStore(props)

	return <MenuContext.Provider value={menu}>{children}</MenuContext.Provider>
}

export type MenuButtonProps = React.PropsWithChildren<{
	cssClass?: ClassValue | ClassValue[]
}> &
	Omit<AriakitMenuButtonProps, 'store'> &
	Pick<ButtonProps, 'iconLeft' | 'iconRight'> & {
		emphasis?: ButtonProps['emphasis']
		icon?: ButtonIconProps['icon']
		kind?: ButtonProps['kind']
		size?: ButtonProps['size'] | ButtonIconProps['size']
	}

const Button = forwardRef<HTMLButtonElement, Omit<MenuButtonProps, 'store'>>(
	({ children, ...props }, ref) => {
		const menu = useMenu()
		const Component = props.icon && !children ? ButtonIcon : OriginalButton

		return (
			<MenuButton as={Component} store={menu} ref={ref} {...props}>
				{children}
			</MenuButton>
		)
	},
)

type ListProps = React.PropsWithChildren<{
	cssClass?: ClassValue | ClassValue[]
}> &
	Partial<MenuProps>

const List = forwardRef<HTMLDivElement, ListProps>(
	({ children, cssClass, ...props }, ref) => {
		const menu = useMenu()

		return (
			<AriakitMenu
				store={menu}
				className={clsx(styles.menuList, cssClass)}
				ref={ref}
				gutter={6}
				{...props}
			>
				{children}
			</AriakitMenu>
		)
	},
)

const Item = forwardRef<HTMLDivElement, MenuItemProps>(
	({ children, ...props }, ref) => (
		<MenuItem
			className={styles.menuItemVariants({ selected: false })}
			ref={ref}
			{...props}
		>
			{children}
		</MenuItem>
	),
)

const Divider = forwardRef<HTMLHRElement, MenuSeparatorProps>(
	({ children, ...props }, ref) => (
		<MenuSeparator className={styles.menuDivider} ref={ref} {...props}>
			{children}
		</MenuSeparator>
	),
)

const Heading = forwardRef<HTMLHeadingElement, MenuHeadingProps>(
	({ children, className, ...props }, ref) => (
		<>
			<AriakitMenuHeading
				className={clsx(styles.menuHeading, className)}
				ref={ref}
				{...props}
			>
				{children}
			</AriakitMenuHeading>
			<Divider />
		</>
	),
)

Menu.Button = Button
Menu.List = List
Menu.Item = Item
Menu.Divider = Divider
Menu.Heading = Heading
