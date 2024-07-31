import * as Ariakit from '@ariakit/react'
import { matchSorter } from 'match-sorter'
import React, { useEffect, useMemo } from 'react'
import { useState } from 'react'

import { Badge } from '../Badge/Badge'
import { Box } from '../Box/Box'
import { Button } from '../Button/Button'
import { IconSolidCheck, IconSolidCheckCircle, IconSolidX } from '../icons'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import * as styles from './styles.css'

type Option = {
	name: string
	value: string | number
	[key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

// Accept strings or options. Strings will be converted to options.
type InitialOptions = string[] | Option[]

type SingleValue = string | number | Option | undefined
type Value = SingleValue | SingleValue[]

// TODO: Handle loading state
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SelectProviderProps<T = any> = {
	checkType?: 'checkmark' | 'checkbox'
	displayMode?: 'normal' | 'tags'
	options?: InitialOptions
	value?: T
	setOptions?: (options: T) => void
	setValue?: (value: T) => void
	onChange?: (value: T) => void
	onValueChange?: (value: T) => void
}

const SelectContext = React.createContext<SelectProviderProps>({
	checkType: 'checkmark',
	displayMode: 'normal',
})

const useSelectContext = () => {
	const context = React.useContext(SelectContext)
	if (!context) {
		throw new Error(
			'Select components must be used within a SelectProvider',
		)
	}
	return context
}

const SelectProvider = <T,>({
	children,
	options: opts,
	value: valueProp,
	onChange,
	onValueChange,
	...props
}: React.PropsWithChildren<
	Omit<SelectProviderProps<T>, 'setValue' | 'setOptions'>
>) => {
	opts = (opts ?? []).map(singleValueToOption)
	const [value, setValue] = useState(valueProp)
	const [options, setOptions] = useState(opts)
	const isMulti = Array.isArray(value)

	const handleSetValue = (newValue: string | string[]) => {
		let newInternalValue: T
		if (isMulti) {
			newInternalValue = options.filter((option) =>
				(newValue as string[]).some((val) => val === option.value),
			) as T
		} else {
			newInternalValue = options.find(
				(option) => option.value === newValue,
			) as T
		}

		setValue(newInternalValue)

		if (onValueChange) {
			onValueChange(newInternalValue)
		}

		if (onChange) {
			onChange(newInternalValue)
		}
	}

	return (
		<SelectContext.Provider
			value={{
				options,
				value,
				setOptions,
				setValue: handleSetValue,
				...props,
			}}
		>
			{children}
		</SelectContext.Provider>
	)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SelectProps<T = any> = Omit<Ariakit.SelectProps, 'value'> & {
	checkType?: SelectProviderProps['checkType']
	defaultValue?: T
	displayMode?: SelectProviderProps['displayMode']
	filterable?: boolean
	trigger?: React.ComponentType
	options?: SelectProviderProps['options']
	store?: Ariakit.SelectProviderProps['store']
	value?: T
	renderValue?: (
		value: Ariakit.SelectStoreState['value'] | Option,
	) => React.ReactElement | string | null
	onChange?: SelectProviderProps['onChange']
	onValueChange?: SelectProviderProps['onValueChange']
}

export const Select = <T,>({
	checkType,
	children,
	displayMode,
	filterable,
	store,
	value,
	options,
	onChange,
	onValueChange,
	...props
}: SelectProps<T>) => {
	store =
		store ??
		Ariakit.useSelectStore({
			defaultValue: valueToString(props.defaultValue),
		})
	value = value ?? props.defaultValue
	options = valueToOptions(options) as Option[]

	const providerProps = {
		checkType,
		displayMode,
		options,
		value: valueToString(value),
		onChange,
		onValueChange,
	}

	if (filterable) {
		if (options) {
			return (
				<SelectProvider {...providerProps}>
					<FilterableSelect
						{...props}
						options={options}
						store={store}
					/>
				</SelectProvider>
			)
		}
	}

	return (
		<SelectProvider {...providerProps}>
			<Provider store={store} options={options}>
				<Trigger {...props} />
				<Popover>
					{Array.isArray(options)
						? options.map((option) => {
								return (
									<Option
										key={option.value}
										value={String(option.value)}
									>
										{option.name}
									</Option>
								)
						  })
						: children}
				</Popover>
			</Provider>
		</SelectProvider>
	)
}

const Trigger: React.FC<Omit<SelectProps, 'value' | 'setValue'>> = ({
	renderValue,
	trigger,
	...props
}) => {
	const Component = trigger ?? SelectTrigger
	const store = Ariakit.useSelectContext()!
	const value = store.useState('value')
	const { displayMode } = useSelectContext()

	const renderSelectValue = (
		selectValue: Ariakit.SelectStoreState['value'],
	) => {
		if (renderValue) {
			return renderValue(selectValue)
		}

		if (displayMode === 'tags') {
			return Array.isArray(selectValue) ? (
				selectValue.map((v) => <SelectTag key={v}>{v}</SelectTag>)
			) : (
				<SelectTag>{selectValue}</SelectTag>
			)
		}

		const isArray = Array.isArray(selectValue)
		if (isArray) {
			return selectValue.length ? selectValue.join(', ') : 'Select...'
		}

		return selectValue
	}

	return <Component {...props}>{renderSelectValue(value)}</Component>
}

type ProviderProps = Ariakit.SelectProviderProps & {
	options: Option[] | undefined
	store: Ariakit.SelectStore<Ariakit.SelectStoreState['value']>
}
export const Provider: React.FC<ProviderProps> = ({ children, ...props }) => {
	const { value, setOptions, setValue } = useSelectContext()
	const items = props.store.useState('items')

	useEffect(() => {
		if (setOptions && !props.options) {
			setOptions(itemsToOptions(items))
		}
	}, [items, value])

	return (
		<Ariakit.SelectProvider
			value={valueToString(value)}
			setValue={setValue}
			{...props}
		>
			{children}
		</Ariakit.SelectProvider>
	)
}

type SelectTriggerProps = Ariakit.SelectProps & {
	hideArrow?: boolean
}
export const SelectTrigger: React.FC<SelectTriggerProps> = ({
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

type LableProps = Ariakit.SelectLabelProps
export const Label: React.FC<LableProps> = ({ children, ...props }) => {
	return <Ariakit.SelectLabel {...props}>{children}</Ariakit.SelectLabel>
}

export const Option: React.FC<Ariakit.SelectItemProps> = ({
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
			<ItemCheck checked={selected} />
			{children ? children : <Text>{value}</Text>}
		</Ariakit.SelectItem>
	)
}

export const ItemCheck: React.FC<Ariakit.SelectItemCheckProps> = ({
	children,
	...props
}) => {
	const { checkType } = useSelectContext()

	if (checkType === 'checkbox') {
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

type FilterableSelectProps = SelectProps & {
	options: Option[]
}
export const FilterableSelect: React.FC<FilterableSelectProps> = ({
	options,
	...props
}) => {
	const [searchValue, setSearchValue] = useState('')
	const store = Ariakit.useSelectStore()

	const matches = useMemo(
		() => matchSorter(options, searchValue, { keys: ['name', 'value'] }),
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
					{matches.map((option) => {
						return (
							<Option
								key={option.value}
								value={String(option.value)}
								render={<Ariakit.ComboboxItem />}
							>
								{option.name}
							</Option>
						)
					})}
				</Ariakit.ComboboxList>
			</Select>
		</Ariakit.ComboboxProvider>
	)
}

const isOption = (value: SingleValue): value is Option => {
	return typeof value === 'object'
}

const optionToString = (option: Option) => {
	return String(option.value)
}

const singleValueToString = (value: SingleValue) => {
	if (isOption(value)) {
		return optionToString(value)
	}

	return String(value)
}

const singleValueToOption = (value: SingleValue) => {
	if (isOption(value)) {
		return value
	}

	return {
		name: String(value),
		value: String(value),
	}
}

const valueToString = (value: any) => {
	if (Array.isArray(value)) {
		return value.map(singleValueToString)
	}

	return singleValueToString(value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const valueToOptions = (value: any | undefined) => {
	if (value === undefined) {
		return undefined
	}

	if (Array.isArray(value)) {
		return value.map(singleValueToOption)
	}

	return singleValueToOption(value)
}

const itemsToOptions = (items: Ariakit.SelectStoreState['items']) => {
	return valueToOptions(items.map((item) => item.value))
}

const SelectTag: React.FC<{ children: string }> = ({ children }) => {
	const selectStore = Ariakit.useSelectContext()!
	const value = selectStore.useState('value')

	return (
		<Badge
			cursor="pointer"
			label={children}
			iconEnd={<IconSolidX />}
			onMouseDown={(e) => {
				e.preventDefault()
				e.stopPropagation()

				const newValue = Array.isArray(value)
					? value.filter((v) => v !== children)
					: ''

				selectStore.setValue(newValue)
			}}
		/>
	)
}

Select.Label = Label
Select.Group = Group
Select.GroupLabel = GroupLabel
Select.Separator = Separator
Select.Option = Option
Select.Popover = Popover
Select.SelectTriggerButton = SelectTriggerButton
Select.useContext = Ariakit.useSelectContext
Select.useStore = Ariakit.useSelectStore
