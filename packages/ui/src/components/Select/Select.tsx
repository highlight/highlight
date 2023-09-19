import React from 'react'
import * as Ariakit from '@ariakit/react'
import { Box } from '../Box/Box'
import { Button } from '../Button/Button'

import * as styles from './styles.css'

type Props = React.PropsWithChildren<Partial<Ariakit.SelectProviderProps>> & {
	className?: string
	label?: React.ReactNode
	gutter?: Ariakit.SelectPopoverOptions['gutter']
	sameWidth?: Ariakit.SelectPopoverOptions['sameWidth']
	store?: Ariakit.SelectProviderProps
}

type SelectComponent = React.FC<Props> & {
	Label: typeof Label
	Option: typeof Option
	OptionCheckbox: typeof OptionCheckbox
	OptionDescription: typeof OptionDescription
	OptionBadge: typeof OptionBadge
	OptionIcon: typeof OptionIcon
}

// Questions:
// 1. Do we want to have a default of a combobox + select for typeahead?
export const Select: SelectComponent = ({
	children,
	className,
	gutter,
	label,
	sameWidth,
	...props
}: Props) => {
	return (
		<Box>
			<Ariakit.SelectProvider {...props}>
				{label && typeof label === 'string' ? (
					<Ariakit.SelectLabel>{label}</Ariakit.SelectLabel>
				) : (
					label
				)}

				<Ariakit.Select className={className} render={<Button />} />

				<Ariakit.SelectPopover
					className={styles.popover}
					gutter={gutter ?? 4}
					sameWidth={sameWidth}
				>
					{/*
					There is a bug in v0.3.2 of Ariakit where you need to have this arrow
					rendered or else positioning of the popover breaks. We render it, but
					hide it by setting size={0}. This is an issue with anything using a
					popover coming from the floating-ui library.
					*/}
					<Ariakit.PopoverArrow size={0} />
					{children}
				</Ariakit.SelectPopover>
			</Ariakit.SelectProvider>
		</Box>
	)
}

export const Label: React.FC<
	React.PropsWithChildren<Ariakit.SelectLabelProps>
> = ({ children, ...props }) => {
	return <Ariakit.SelectLabel {...props}>{children}</Ariakit.SelectLabel>
}

export const Option: React.FC<
	React.PropsWithChildren<Ariakit.SelectItemProps>
> = ({ children, ...props }) => {
	return (
		<Ariakit.SelectItem className={styles.option} {...props}>
			{children}
		</Ariakit.SelectItem>
	)
}

export const OptionCheckbox: React.FC<
	React.PropsWithChildren<Ariakit.SelectItemCheckProps>
> = ({ children, ...props }) => {
	return (
		<Ariakit.SelectItemCheck {...props}>{children}</Ariakit.SelectItemCheck>
	)
}

export const OptionDescription: React.FC<React.PropsWithChildren> = ({
	children,
	...props
}) => {
	return <Box {...props}>{children}</Box>
}

export const OptionBadge: React.FC<React.PropsWithChildren> = ({
	children,
	...props
}) => {
	return <Box {...props}>{children}</Box>
}

export const OptionIcon: React.FC<React.PropsWithChildren> = ({
	children,
	...props
}) => {
	return <Box {...props}>{children}</Box>
}

Select.Option = Option
Select.Label = Label
Select.OptionCheckbox = OptionCheckbox
Select.OptionDescription = OptionDescription
Select.OptionBadge = OptionBadge
Select.OptionIcon = OptionIcon
