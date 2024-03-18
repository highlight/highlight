import * as Ariakit from '@ariakit/react'
import React from 'react'

export const useComboboxStore = Ariakit.useComboboxStore

type Props = React.PropsWithChildren & Ariakit.ComboboxProps

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
		<Ariakit.Combobox ref={ref} {...props}>
			{children}
		</Ariakit.Combobox>
	)
}) as ComboboxComponent

export const Popover: React.FC<
	React.PropsWithChildren & Ariakit.ComboboxPopoverProps
> = ({ children, ...props }) => {
	props.gutter = props.gutter ?? 4

	return (
		<Ariakit.ComboboxPopover {...props}>
			{/*
			There is a bug in v0.2.17 of Ariakit where you need to have this arrow
			rendered or else positioning of the popover breaks. We render it, but hide
			it by setting size={0}. This is an issue with anything using a popover
			coming from the floating-ui library.
			*/}
			<Ariakit.PopoverArrow size={0} />
			{children}
		</Ariakit.ComboboxPopover>
	)
}

export const Item: React.FC<
	React.PropsWithChildren & Ariakit.ComboboxItemProps
> = ({ children, ...props }) => {
	return <Ariakit.ComboboxItem {...props}>{children}</Ariakit.ComboboxItem>
}

export const Group: React.FC<
	React.PropsWithChildren & Ariakit.ComboboxGroupProps
> = ({ children, ...props }) => {
	return <Ariakit.ComboboxGroup {...props}>{children}</Ariakit.ComboboxGroup>
}

export const GroupLabel: React.FC<
	React.PropsWithChildren & Ariakit.ComboboxGroupLabelProps
> = ({ children, ...props }) => {
	return (
		<Ariakit.ComboboxGroupLabel {...props}>
			{children}
		</Ariakit.ComboboxGroupLabel>
	)
}

Combobox.Popover = Popover
Combobox.Item = Item
Combobox.Group = Group
Combobox.GroupLabel = GroupLabel
