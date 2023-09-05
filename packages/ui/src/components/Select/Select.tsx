import React from 'react'
import { Box } from '../Box/Box'
import * as Ariakit from '@ariakit/react'

import * as styles from './styles.css'

type Props = React.PropsWithChildren<
	Partial<Ariakit.SelectState> &
		styles.Variants & {
			store?: Ariakit.SelectStore
		}
>

type SelectComponent = React.FC<Props> & {
	Item: typeof Item
	ItemCheckbox: typeof ItemCheckbox
	ItemDescription: typeof ItemDescription
	ItemBadge: typeof ItemBadge
	ItemIcon: typeof ItemIcon
}

export const Select: SelectComponent = ({ children, ...props }) => {
	const selectStore = props.store ?? Ariakit.useSelectStore({ ...props })

	return (
		<Ariakit.Select
			store={selectStore}
			cssClass={styles.variants({ ...props })}
		>
			{children}
		</Ariakit.Select>
	)
}

export const Item: React.FC<React.PropsWithChildren> = ({
	children,
	...props
}) => {
	return <Box {...props}>{children}</Box>
}

export const ItemCheckbox: React.FC<React.PropsWithChildren> = ({
	children,
	...props
}) => {
	return <Box {...props}>{children}</Box>
}

export const ItemDescription: React.FC<React.PropsWithChildren> = ({
	children,
	...props
}) => {
	return <Box {...props}>{children}</Box>
}

export const ItemBadge: React.FC<React.PropsWithChildren> = ({
	children,
	...props
}) => {
	return <Box {...props}>{children}</Box>
}

export const ItemIcon: React.FC<React.PropsWithChildren> = ({
	children,
	...props
}) => {
	return <Box {...props}>{children}</Box>
}

Select.Item = Item
Select.ItemCheckbox = ItemCheckbox
Select.ItemDescription = ItemDescription
Select.ItemBadge = ItemBadge
Select.ItemIcon = ItemIcon
