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

type SingleValue = Option | string
type Value = SingleValue[]

type SelectContext = {
	selectValue: Ariakit.SelectStoreState['value']
	checkType?: 'checkmark' | 'checkbox'
	multi?: boolean
	value?: SingleValue | Value
	setValue?: (value: SingleValue | Value) => void
}

const SelectContext = React.createContext<SelectContext>({
	selectValue: '',
	checkType: 'checkmark',
	multi: false,
	value: undefined,
	setValue: undefined,
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

const SelectProvider: React.FC<
	React.PropsWithChildren<Omit<SelectContext, 'selectValue'>>
> = ({
	children,
	checkType,
	multi,
	value: valueProp,
	setValue: setValueProp,
}) => {
	const getOptionValue = (option: Option | string | undefined) => {
		if (typeof option === 'object') {
			return String(option.value)
		}

		return String(option)
	}

	const getSelectValue = (value: SingleValue | Value | undefined) => {
		if (Array.isArray(value)) {
			return value.map(getOptionValue)
		}

		return getOptionValue(value)
	}

	const [value, setValue] = useState<SingleValue | Value>(valueProp ?? '')
	const [selectValue, setSelectValue] = useState<
		Ariakit.SelectStoreState['value']
	>(getSelectValue(valueProp))
	const isMulti = multi ?? Array.isArray(value)

	return (
		<SelectContext.Provider
			value={{
				checkType,
				multi: isMulti,
				selectValue,
				value,
				setValue: (newValue) => {
					let newInternalValue = newValue
					if (Array.isArray(value)) {
						const inArray = value.find((v) => {
							typeof v === 'object'
								? v.value === newValue
								: v === newValue
						})

						newInternalValue = inArray
							? (value.filter((v) =>
									typeof v === 'object'
										? v.value !== newValue
										: v !== newValue,
							  ) as Value)
							: ([...value, newValue] as Value)
					}

					setValue(newInternalValue)
					setSelectValue(getSelectValue(newValue))

					if (setValueProp) {
						setValueProp(newInternalValue)
					}
				},
			}}
		>
			{children}
		</SelectContext.Provider>
	)
}

type SelectBaseProps = Ariakit.SelectProps & {
	checkbox?: boolean
	trigger?: React.ComponentType
	store?: Ariakit.SelectProviderProps['store']
	// TODO: Update these to be more generic. Allow assigning any Option value to
	// the value prop. Also, consider adding a new context that can store some
	// config for the components.
	// TODO: Also consider allowing the component to be a multi select by passing
	// a prop or an array for the value.
	// TODO: Consider always making it a controlled input, never calling
	// `setValue`, and manually setting the values in the store, but allowing any
	// option values to be passed in, they just need to be transformable to string
	// | string[].
	renderValue?: (
		value: Ariakit.SelectStoreState['value'] | Option,
	) => React.ReactElement | string | null
	defaultValue?: SelectContext['value']
	value?: SelectContext['value']
	setValue?: SelectContext['setValue']
}

type Option = {
	name: string
	value: string | number
	[key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

type OptionsProp = Option[] | string[]

type FilterableSelectProps = SelectBaseProps & {
	filterable: true
	options: OptionsProp
}

type NonFilterableSelectProps = SelectBaseProps & {
	children?: React.ReactNode
	filterable?: false | undefined
	options?: OptionsProp
}

type SelectProps = FilterableSelectProps | NonFilterableSelectProps

type SelectComponent = React.FC<SelectProps> & {
	Label: typeof Label
	Group: typeof Group
	GroupLabel: typeof GroupLabel
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
	setValue,
	...props
}) => {
	store = store ?? Ariakit.useSelectStore()
	value = value ?? props.defaultValue

	if (filterable) {
		return (
			<SelectProvider value={value} setValue={setValue}>
				<FilterableSelect
					{...(props as FilterableSelectProps)}
					store={store}
				/>
			</SelectProvider>
		)
	}

	return (
		<SelectProvider value={value} setValue={setValue}>
			<Provider store={store}>
				<Trigger {...props} />
				<Popover>
					{props.options
						? props.options.map((option) => {
								const value =
									typeof option === 'object'
										? option.value
										: option
								const name =
									typeof option === 'object'
										? option.name
										: option

								return (
									<Option
										key={value}
										value={String(value)}
										checkbox={props.checkbox}
									>
										{name}
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
	const Component = trigger ?? SelectTriggerButton
	const { selectValue } = useSelectContext()

	const renderSelectValue = (
		selectValue: Ariakit.SelectStoreState['value'],
	) => {
		if (renderValue) {
			return renderValue(selectValue)
		}

		if (props.options) {
			const option = props.options.find((o) =>
				typeof o === 'object'
					? String(o.value) === selectValue
					: o === selectValue,
			)

			if (option) {
				return typeof option === 'object' ? option.name : option
			}
		}

		const isArray = Array.isArray(selectValue)
		if (isArray) {
			return selectValue.length ? selectValue.join(', ') : 'Select...'
		}

		return selectValue
	}

	return <Component>{renderSelectValue(selectValue)}</Component>
}

type ProviderProps = Ariakit.SelectProviderProps
export const Provider: React.FC<ProviderProps> = ({ children, ...props }) => {
	const { selectValue, setValue } = useSelectContext()

	return (
		<Ariakit.SelectProvider
			value={selectValue}
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

type LableProps = Ariakit.SelectLabelProps
export const Label: React.FC<LableProps> = ({ children, ...props }) => {
	return <Ariakit.SelectLabel {...props}>{children}</Ariakit.SelectLabel>
}

export type ItemProps = Ariakit.SelectItemProps & {
	checkbox?: boolean
}
export const Option: React.FC<ItemProps> = ({ children, ...props }) => {
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
					{matches.map((option) => {
						const value =
							typeof option === 'object' ? option.value : option
						const name =
							typeof option === 'object' ? option.name : option

						return (
							<Option
								key={value}
								value={String(value)}
								render={<Ariakit.ComboboxItem />}
								checkbox={checkbox}
							>
								{name}
							</Option>
						)
					})}
				</Ariakit.ComboboxList>
			</Select>
		</Ariakit.ComboboxProvider>
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
