import * as Ariakit from '@ariakit/react'
import { matchSorter } from 'match-sorter'
import React, { useMemo } from 'react'
import { useState } from 'react'

import { Box } from '../Box/Box'
import { Button } from '../Button/Button'
import { IconSolidCheck, IconSolidCheckCircle } from '../icons'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import * as styles from './styles.css'

type SelectBaseProps = Ariakit.SelectProps & {
	trigger?: React.ComponentType
	renderValue?: (
		value: Ariakit.SelectStoreState['value'],
	) => React.ReactElement | string | null
	store?: Ariakit.SelectProviderProps['store']
	value?: Ariakit.SelectProviderProps['value']
	setValue?: Ariakit.SelectProviderProps['setValue']
}

type FilterableSelectProps = SelectBaseProps & {
	filterable: true
	options: string[]
	checkbox?: boolean
}

type NonFilterableSelectProps = SelectBaseProps & {
	children?: React.ReactNode
	filterable?: false | undefined
	options?: string[]
}

type SelectProps = FilterableSelectProps | NonFilterableSelectProps

type SelectComponent = React.FC<SelectProps> & {
	Label: typeof Label
	Group: typeof Group
	GroupLabel: typeof GroupLabel
	Provider: typeof Provider
	Option: typeof Option
	Popover: typeof Popover
	Separator: typeof Separator
	SelectTriggerButton: typeof SelectTriggerButton
	useContext: typeof Ariakit.useSelectContext
	useStore: typeof Ariakit.useSelectStore
}

export const Select: SelectComponent = ({
	children,
	filterable,
	store,
	value,
	renderValue,
	setValue,
	...props
}) => {
	store = store ?? Ariakit.useSelectStore()
	const selectValue = store.useState('value')
	const Trigger = props.trigger ?? SelectButton

	const renderSelectValue = (
		selectValue: Ariakit.SelectStoreState['value'],
	) => {
		if (renderValue) {
			return renderValue(selectValue)
		}

		const isArray = Array.isArray(selectValue)
		if (isArray) {
			return selectValue.join(', ')
		}

		return selectValue
	}

	if (filterable) {
		return (
			<FilterableSelect
				{...(props as FilterableSelectProps)}
				store={store}
			/>
		)
	}

	return (
		<Provider value={value} setValue={setValue} store={store}>
			<Trigger {...props}>{renderSelectValue(selectValue)}</Trigger>
			<Popover>{children}</Popover>
		</Provider>
	)
}

type SelectTriggerProps = Ariakit.SelectProps & {
	hideArrow?: boolean
}
export const SelectButton: React.FC<SelectTriggerProps> = ({
	children,
	hideArrow,
	...props
}) => {
	return (
		<Ariakit.Select className={styles.select} {...props}>
			<Stack direction="row" align="center" justify="space-between">
				<Stack direction="row" align="center" gap="6">
					{typeof children === 'string' ? (
						<Text color="secondaryContentOnEnabled">
							{children}
						</Text>
					) : (
						children
					)}
				</Stack>

				{!hideArrow && <Ariakit.SelectArrow />}
			</Stack>
		</Ariakit.Select>
	)
}

export const SelectTriggerButton: React.FC<SelectTriggerProps> = ({
	children,
	...props
}) => {
	return (
		<Ariakit.Select {...props} render={<Button />}>
			<Stack direction="row" gap="4" align="center">
				{children}
				<Ariakit.SelectArrow />
			</Stack>
		</Ariakit.Select>
	)
}

type ProviderProps = Ariakit.SelectProviderProps
export const Provider: React.FC<ProviderProps> = ({ children, ...props }) => {
	return (
		<Ariakit.SelectProvider {...props}>{children}</Ariakit.SelectProvider>
	)
}

type LableProps = Ariakit.SelectLabelProps
export const Label: React.FC<LableProps> = ({ children, ...props }) => {
	return <Ariakit.SelectLabel {...props}>{children}</Ariakit.SelectLabel>
}

export type ItemProps = Ariakit.SelectItemProps & {
	checkbox?: boolean
}
export const Option: React.FC<ItemProps> = ({
	checkbox,
	children,
	...props
}) => {
	let value = props.value

	if (!value && typeof children === 'string') {
		value = children
	}

	const storeValue = Ariakit.useSelectContext()!.useState('value')
	const selected =
		Array.isArray(storeValue) && value
			? storeValue.includes(value)
			: storeValue === value

	return (
		<Ariakit.SelectItem
			focusOnHover
			value={value}
			className={styles.item}
			{...props}
		>
			<ItemCheck checked={selected} checkbox={checkbox} />
			{value ? <Text>{value}</Text> : children}
		</Ariakit.SelectItem>
	)
}

type ItemCheck = Ariakit.SelectItemCheckProps & {
	checkbox?: boolean
}
export const ItemCheck: React.FC<ItemCheck> = ({
	children,
	checkbox,
	...props
}) => {
	if (checkbox) {
		return (
			<Box cssClass={styles.checkbox}>
				{props.checked && (
					<IconSolidCheckCircle color="white" size="13" />
				)}
			</Box>
		)
	}

	return (
		<Ariakit.SelectItemCheck {...props}>
			{children ?? <IconSolidCheck size="16" />}
		</Ariakit.SelectItemCheck>
	)
}

type PopoverProps = Ariakit.SelectPopoverProps
export const Popover: React.FC<PopoverProps> = ({ children, ...props }) => {
	return (
		<Ariakit.SelectPopover
			sameWidth
			gutter={4}
			className={styles.popover}
			{...props}
		>
			{/*
			There is a bug in Ariakit where you need to have this arrow rendered or
			else positioning of the popover breaks. We render it, but hide it by
			setting size={0}. This is an issue with anything using a popover coming
			from the floating-ui library.
			*/}
			<Ariakit.PopoverArrow size={0} />

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

export const FilterableSelect: React.FC<
	Omit<FilterableSelectProps, 'filterable'>
> = ({ checkbox, options, ...props }) => {
	const [searchValue, setSearchValue] = useState('')
	const store = Ariakit.useSelectStore()

	const matches = useMemo(
		() => matchSorter(options, searchValue),
		[options, searchValue],
	)

	return (
		<Ariakit.ComboboxProvider
			resetValueOnHide
			setValue={(v) => setSearchValue(v)}
		>
			<Select store={store} {...props}>
				<Box px="4" pb="4">
					<Ariakit.Combobox
						autoSelect
						placeholder="Search..."
						className={styles.combobox}
						onSelect={() => setSearchValue('')}
					/>
				</Box>

				<Ariakit.ComboboxList>
					{matches.map((value) => (
						<Option
							key={value}
							value={value}
							render={<Ariakit.ComboboxItem />}
							checkbox={checkbox}
						/>
					))}
				</Ariakit.ComboboxList>
			</Select>
		</Ariakit.ComboboxProvider>
	)
}

Select.Label = Label
Select.Group = Group
Select.GroupLabel = GroupLabel
Select.Separator = Separator
Select.Provider = Provider
Select.Option = Option
Select.Popover = Popover
Select.SelectTriggerButton = SelectTriggerButton
Select.useContext = Ariakit.useSelectContext
Select.useStore = Ariakit.useSelectStore
