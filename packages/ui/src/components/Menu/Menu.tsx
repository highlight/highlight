import * as Ariakit from '@ariakit/react'
import clsx, { ClassValue } from 'clsx'
import React from 'react'
import {
	Button as OriginalButton,
	ButtonProps as ButtonProps,
} from '../Button/Button'

import { ButtonIcon, Props as ButtonIconProps } from '../ButtonIcon/ButtonIcon'
import * as styles from './styles.css'

const MenuContext = React.createContext<Ariakit.MenuStore>(
	{} as Ariakit.MenuStore,
)
export const useMenu = () => React.useContext(MenuContext)

type Props = React.PropsWithChildren<Partial<Ariakit.MenuStoreProps>>

type MenuComponent = React.FC<Props> & {
	Button: typeof Button
	List: typeof List
	Item: typeof Item
	Divider: typeof Divider
	Heading: typeof Heading
}

export const Menu: MenuComponent = ({ children, ...props }: Props) => {
	const menu = Ariakit.useMenuStore(props)

	return <MenuContext.Provider value={menu}>{children}</MenuContext.Provider>
}

export type MenuButtonProps = React.PropsWithChildren<{
	cssClass?: ClassValue | ClassValue[]
}> &
	Omit<Ariakit.MenuButtonProps, 'store'> &
	Pick<ButtonProps, 'iconLeft' | 'iconRight'> & {
		emphasis?: ButtonProps['emphasis']
		icon?: ButtonIconProps['icon']
		kind?: ButtonProps['kind']
		size?: ButtonProps['size'] | ButtonIconProps['size']
	}

const Button: React.FC<Omit<MenuButtonProps, 'store'>> = ({
	children,
	...props
}) => {
	const menu = useMenu()
	const Component = props.icon && !children ? ButtonIcon : OriginalButton

	return (
		<Ariakit.MenuButton as={Component} store={menu} {...props}>
			{children}
		</Ariakit.MenuButton>
	)
}

type ListProps = React.PropsWithChildren<{
	cssClass?: ClassValue | ClassValue[]
}> &
	Partial<Ariakit.MenuProps>

const List: React.FC<ListProps> = ({ children, cssClass, ...props }) => {
	const menu = useMenu()

	return (
		<Ariakit.Menu
			store={menu}
			gutter={4}
			className={clsx(styles.menuList, cssClass)}
			{...props}
		>
			{/*
			There is a bug in v0.2.17 of Ariakit where you need to have this arrow
			rendered or else positioning of the popover breaks. We render it, but hide
			it by setting size={0}. This is an issue with anything using a popover
			coming from the floating-ui library.
			*/}
			<Ariakit.MenuArrow size={0} />
			{children}
		</Ariakit.Menu>
	)
}

const Item: React.FC<Ariakit.MenuItemProps> = ({ children, ...props }) => (
	<Ariakit.MenuItem
		className={styles.menuItemVariants({ selected: false })}
		{...props}
	>
		{children}
	</Ariakit.MenuItem>
)

const Divider: React.FC<Ariakit.MenuSeparatorProps> = ({
	children,
	...props
}) => (
	<Ariakit.MenuSeparator className={styles.menuDivider} {...props}>
		{children}
	</Ariakit.MenuSeparator>
)

const Heading: React.FC<Ariakit.MenuHeadingProps> = ({
	children,
	className,
	...props
}) => (
	<>
		<Ariakit.MenuHeading
			className={clsx(styles.menuHeading, className)}
			{...props}
		>
			{children}
		</Ariakit.MenuHeading>
		<Divider />
	</>
)

Menu.Button = Button
Menu.List = List
Menu.Item = Item
Menu.Divider = Divider
Menu.Heading = Heading
