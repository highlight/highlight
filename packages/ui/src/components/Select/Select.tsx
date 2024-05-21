import * as Ariakit from '@ariakit/react'

import { Stack } from '@/components/Stack/Stack'

import { Box } from '../Box/Box'
import * as styles from './styles.css'

export type SelectProps = React.PropsWithChildren<Ariakit.SelectProviderProps>

type SelectComponent = React.FC<SelectProps> & {
	Label: typeof Label
	Group: typeof Group
	GroupLabel: typeof GroupLabel
	Trigger: typeof Trigger
	Item: typeof Item
	Popover: typeof Popover
	Separator: typeof Separator
	useContext: typeof Ariakit.useSelectContext
	useStore: typeof Ariakit.useSelectStore
}

export const Select: SelectComponent = ({ children, ...props }) => {
	return (
		<Ariakit.SelectProvider {...props}>{children}</Ariakit.SelectProvider>
	)
}

type LableProps = Ariakit.SelectLabelProps
export const Label: React.FC<LableProps> = ({ children, ...props }) => {
	return <Ariakit.SelectLabel {...props}>{children}</Ariakit.SelectLabel>
}

type TriggerProps = Ariakit.SelectProps
export const Trigger: React.FC<TriggerProps> = ({ children, ...props }) => {
	return (
		<Ariakit.Select {...props}>
			<Stack direction="row" align="center" gap="6">
				{children}
				<Ariakit.SelectArrow />
			</Stack>
		</Ariakit.Select>
	)
}

type ItemProps = Ariakit.SelectItemProps
export const Item: React.FC<ItemProps> = ({ children, ...props }) => {
	let value = props.value

	if (!value && typeof children === 'string') {
		value = children
	}

	return (
		<Ariakit.SelectItem
			focusOnHover
			render={
				<Stack
					cursor="pointer"
					direction="row"
					align="center"
					gap="8"
					cssClass={styles.item}
				/>
			}
			value={value}
			{...props}
		>
			<ItemCheck />
			{value}
		</Ariakit.SelectItem>
	)
}

type ItemCheck = Ariakit.SelectItemCheckProps
export const ItemCheck: React.FC<ItemCheck> = ({ children, ...props }) => {
	return (
		<Ariakit.SelectItemCheck {...props}>{children}</Ariakit.SelectItemCheck>
	)
}

type PopoverProps = Ariakit.SelectPopoverProps
export const Popover: React.FC<PopoverProps> = ({ children, ...props }) => {
	return (
		<Ariakit.SelectPopover
			sameWidth
			gutter={4}
			render={
				<Box
					backgroundColor="white"
					borderRadius="4"
					border="dividerWeak"
					boxShadow="small"
					cssClass={styles.popover}
				/>
			}
			{...props}
		>
			{children}
		</Ariakit.SelectPopover>
	)
}

export const Group: React.FC<React.PropsWithChildren> = ({ children }) => {
	return <Ariakit.SelectGroup>{children}</Ariakit.SelectGroup>
}

type GroupLabelProps = Ariakit.SelectGroupLabelProps
export const GroupLabel: React.FC<GroupLabelProps> = ({
	children,
	...props
}) => {
	return (
		<Ariakit.SelectGroupLabel {...props}>
			{children}
		</Ariakit.SelectGroupLabel>
	)
}

type SeparatorProps = Ariakit.SelectSeparatorProps
export const Separator: React.FC<SeparatorProps> = ({ ...props }) => {
	return <Ariakit.SelectSeparator {...props} />
}

// TODO: Figure out how to use Combobox w/ Select
// NOTE: Suggest input is probably a different component, more similar to input
// <Select multi filterable />
// <Select.Filterable
//   items={items}
//   selectedItem={selectedItem}
//   onChange={handleChange}
// />
// <Select.Querable />

Select.Label = Label
Select.Group = Group
Select.GroupLabel = GroupLabel
Select.Separator = Separator
Select.Trigger = Trigger
Select.Item = Item
Select.Popover = Popover
Select.useContext = Ariakit.useSelectContext
Select.useStore = Ariakit.useSelectStore
