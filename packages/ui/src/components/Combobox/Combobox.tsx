import React from 'react'
import {
	useComboboxState as ariakitUseComboboxState,
	Combobox as AriakitCombobox,
	ComboboxProps as AriakitComboboxProps,
	ComboboxItem as AriakitComboboxItem,
	ComboboxItemProps as AriakitComboboxItemProps,
	ComboboxGroup as AriakitComboboxGroup,
	ComboboxGroupProps as AriakitComboboxGroupProps,
	ComboboxGroupLabel as AriakitComboboxGroupLabel,
	ComboboxGroupLabelProps as AriakitComboboxGroupLabelProps,
	ComboboxPopover as AriakitComboboxPopover,
	ComboboxPopoverProps as AriakitComboboxPopoverProps,
} from 'ariakit/combobox'

export const useComboboxState = ariakitUseComboboxState

type Props = React.PropsWithChildren & AriakitComboboxProps

type ComboboxComponent = React.ForwardRefExoticComponent<Props> & {
	Popover: typeof Popover
	Item: typeof Item
	Group: typeof Group
	GroupLabel: typeof GroupLabel
}

export const Combobox = React.forwardRef<
	HTMLInputElement | null,
	React.PropsWithoutRef<Props>
>(({ children, ...props }, ref) => {
	return (
		<AriakitCombobox ref={ref} {...props}>
			{children}
		</AriakitCombobox>
	)
}) as ComboboxComponent

export const Popover: React.FC<
	React.PropsWithChildren & AriakitComboboxPopoverProps
> = ({ children, ...props }) => {
	return (
		<AriakitComboboxPopover {...props}>{children}</AriakitComboboxPopover>
	)
}

export const Item: React.FC<
	React.PropsWithChildren & AriakitComboboxItemProps
> = ({ children, ...props }) => {
	return <AriakitComboboxItem {...props}>{children}</AriakitComboboxItem>
}

export const Group: React.FC<
	React.PropsWithChildren & AriakitComboboxGroupProps
> = ({ children, ...props }) => {
	return <AriakitComboboxGroup {...props}>{children}</AriakitComboboxGroup>
}

export const GroupLabel: React.FC<
	React.PropsWithChildren & AriakitComboboxGroupLabelProps
> = ({ children, ...props }) => {
	return (
		<AriakitComboboxGroupLabel {...props}>
			{children}
		</AriakitComboboxGroupLabel>
	)
}

Combobox.Popover = Popover
Combobox.Item = Item
Combobox.Group = Group
Combobox.GroupLabel = GroupLabel
