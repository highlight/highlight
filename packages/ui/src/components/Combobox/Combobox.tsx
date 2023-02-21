import React from 'react'
import {
	useComboboxState as ariakitUseComboboxState,
	Combobox as AriakitCombobox,
	ComboboxProps as AriakitComboboxProps,
	ComboboxItem as AriakitComboboxItem,
	ComboboxItemProps as AriakitComboboxItemProps,
	ComboboxPopover as AriakitComboboxPopover,
	ComboboxPopoverProps as AriakitComboboxPopoverProps,
} from 'ariakit/combobox'

export const useComboboxState = ariakitUseComboboxState

type Props = React.PropsWithChildren & AriakitComboboxProps

type ComboboxComponent = React.ForwardRefExoticComponent<Props> & {
	Popover: typeof Popover
	Item: typeof Item
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

Combobox.Popover = Popover
Combobox.Item = Item
