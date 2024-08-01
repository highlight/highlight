import * as Ariakit from '@ariakit/react'
import { isEqual } from 'lodash'
import { matchSorter } from 'match-sorter'
import React, { useEffect, useMemo } from 'react'
import { useState } from 'react'

import { Badge } from '../Badge/Badge'
import { Box } from '../Box/Box'
import { Button } from '../Button/Button'
import {
	IconSolidCheck,
	IconSolidCheckCircle,
	IconSolidSelector,
	IconSolidX,
} from '../icons'
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SelectProviderProps<T = any> = {
	checkType?: 'checkmark' | 'checkbox'
	defaultValue?: T
	displayMode?: 'normal' | 'tags'
	loading?: boolean
	options?: InitialOptions
	value?: T
	setOptions?: (options: T) => void
	setValue?: (value: T) => void
	onChange?: (value: T) => void
}

const SelectContext = React.createContext<SelectProviderProps>({
	checkType: 'checkmark',
	displayMode: 'normal',
	loading: false,
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
	...props
}: React.PropsWithChildren<
	Omit<SelectProviderProps<T>, 'setValue' | 'setOptions'>
>) => {
	opts = (opts ?? []).map(singleValueToOption)
	const [value, setValue] = useState(valueProp)
	const [options, setOptions] = useState(opts)
	const isMulti = Array.isArray(value)

	/* eslint-disable @typescript-eslint/no-explicit-any */
	const handleSetValue = (newValue: string | string[]) => {
		let newInternalValue: any
		if (options?.length) {
			if (isMulti) {
				newInternalValue = [...value]
				;(newValue as string[]).forEach((option) => {
					const foundOption = options.find((o) => o.value === option)
					const isSelected = newInternalValue.some(
						(v: any) => v.value === foundOption?.value,
					)

					if (foundOption && !isSelected) {
						newInternalValue.push(foundOption)
					}
				})

				newInternalValue = newInternalValue.filter((item: any) =>
					newValue.includes(item.value),
				)
			} else {
				newInternalValue = options.find(
					(option) => String(option.value) === newValue,
				)
			}
		} else {
			newInternalValue = newValue
		}

		setValue(newInternalValue)

		if (onChange) {
			onChange(newInternalValue)
		}
	}
	/* eslint-enable @typescript-eslint/no-explicit-any */

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
export type SelectProps<T = any> = Omit<
	Ariakit.SelectProps,
	'defaultValue' | 'value' | 'onChange'
> & {
	checkType?: SelectProviderProps['checkType']
	defaultValue?: T
	displayMode?: SelectProviderProps['displayMode']
	filterable?: boolean
	loading?: SelectProviderProps['loading']
	trigger?: React.ComponentType
	options?: SelectProviderProps['options']
	store?: Ariakit.SelectProviderProps['store']
	value?: T
	renderValue?: (
		value: Ariakit.SelectStoreState['value'],
	) => React.ReactElement | string | null
	onChange?: SelectProviderProps['onChange']
}

export const Select = <T,>({
	checkType,
	children,
	displayMode,
	filterable,
	loading,
	store,
	value: valueProp,
	options,
	onChange,
	...props
}: SelectProps<T>) => {
	const value = valueProp ?? props.defaultValue
	options = valueToOptions(options) as Option[]
	store =
		store ??
		Ariakit.useSelectStore({
			defaultValue: props.defaultValue
				? valueToString(props.defaultValue)
				: undefined,
		})

	const providerProps = {
		checkType,
		defaultValue: props.defaultValue,
		displayMode,
		loading,
		options,
		value: valueToOptions(value),
		onChange,
	}

	useEffect(() => {
		if (store && valueProp) {
			const storeValue = store.getState().value
			const stringValue = valueToString(valueProp)

			if (!isEqual(stringValue, storeValue)) {
				store.setValue(stringValue)
			}
		}
	}, [valueProp])

	if (filterable) {
		return (
			<FilterableSelect
				checkType={checkType}
				displayMode={displayMode}
				loading={loading}
				options={options}
				store={store}
				value={value}
				onChange={onChange}
				{...props}
			/>
		)
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
	const { displayMode, loading } = useSelectContext()

	if (loading) {
		props.disabled = true
	}

	const renderSelectValue = (
		selectValue: Ariakit.SelectStoreState['value'],
	) => {
		if (renderValue) {
			return renderValue(selectValue)
		}

		if (displayMode === 'tags') {
			if (
				!selectValue ||
				(Array.isArray(selectValue) && !selectValue.length)
			) {
				return 'Select...'
			}

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

	return (
		<Component style={{ opacity: loading ? 0.8 : 1 }} {...props}>
			{renderSelectValue(value)}
		</Component>
	)
}

type ProviderProps = Ariakit.SelectProviderProps & {
	store: Ariakit.SelectStore<Ariakit.SelectStoreState['value']>
	options?: Option[] | undefined
}
export const Provider: React.FC<ProviderProps> = ({ children, ...props }) => {
	const { value, setOptions, setValue } = useSelectContext()
	const items = props.store.useState('items')

	useEffect(() => {
		if (setOptions && !props.options) {
			setOptions(itemsToOptions(items))
		}
	}, [items])

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

				{!hideArrow && (
					<Ariakit.SelectArrow render={<IconSolidSelector />} />
				)}
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
				<Ariakit.SelectArrow render={<IconSolidSelector />} />
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

type FilterableSelectProps = SelectProps & {
	options: Option[]
}
export const FilterableSelect: React.FC<FilterableSelectProps> = ({
	options,
	...props
}) => {
	const [searchValue, setSearchValue] = useState('')

	const matches = useMemo(
		() => matchSorter(options, searchValue, { keys: ['name', 'value'] }),
		[options, searchValue],
	)

	return (
		<Ariakit.ComboboxProvider
			resetValueOnHide
			setValue={(v) => setSearchValue(v)}
		>
			<Select {...props}>
				<Box px="4" pb="4">
					<Ariakit.Combobox
						autoSelect
						placeholder="Search..."
						className={styles.combobox}
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
					/>
				</Box>

				<Ariakit.ComboboxList>
					{matches.map((option) => {
						return (
							<Option
								key={option.value}
								value={String(option.value)}
								render={<Ariakit.ComboboxItem />}
								onClick={() => setSearchValue('')}
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
	return String(option.name)
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
			shape="basic"
			variant="white"
			size="medium"
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
Select.Option = Option
Select.Popover = Popover
Select.SelectTriggerButton = SelectTriggerButton
Select.useContext = Ariakit.useSelectContext
Select.useStore = Ariakit.useSelectStore
