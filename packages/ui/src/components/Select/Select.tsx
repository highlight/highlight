import * as Ariakit from '@ariakit/react'
import { isEqual } from 'lodash'
import { matchSorter } from 'match-sorter'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { Badge } from '../Badge/Badge'
import { Box } from '../Box/Box'
import { Button } from '../Button/Button'
import { ButtonIcon } from '../ButtonIcon/ButtonIcon'
import {
	IconSolidCheck,
	IconSolidCheckCircle,
	IconSolidSelector,
	IconSolidX,
	IconSolidXCircle,
} from '../icons'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import * as styles from './styles.css'
import { themeVars } from '../../theme'

export type SelectOption = {
	name: string
	value: string | number
	[key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

// Accept strings or options. Strings will be converted to options.
type InitialOptions = string[] | SelectOption[]

type SingleValue = string | number | SelectOption | undefined

// Potential future refactoring: improve types and allow any shape of options,
// including string(s). Also, make default SelectOption for callbacks.
//
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SelectProviderProps<T = any> = {
	checkType?: 'checkmark' | 'checkbox'
	clearable?: boolean
	defaultValue?: T
	displayMode?: 'normal' | 'tags'
	loading?: boolean
	options?: InitialOptions
	value?: T
	setOptions?: (options: T) => void
	setValue?: (value: T) => void
	onValueChange?: (value: T) => void
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
	options,
	value: valueProp,
	onValueChange,
	...props
}: React.PropsWithChildren<Omit<SelectProviderProps<T>, 'setValue'>>) => {
	const opts = (options ?? []).map(singleValueToOption)
	const [value, setValue] = useState(valueProp)

	/* eslint-disable @typescript-eslint/no-explicit-any */
	const handleSetValue = (newValue: string | string[]) => {
		const noValue = Array.isArray(value) ? value.length === 0 : !value
		// Avoid triggering the callback if we haven't initialized yet.
		const noCallback = (!opts.length && noValue) || props.loading

		let newInternalValue: any
		if (opts.length) {
			if (Array.isArray(newValue) && Array.isArray(value)) {
				newInternalValue = [...value]
				;(newValue as string[]).forEach((option) => {
					const foundOption = opts.find((o) =>
						optionsMatch(o, option),
					)
					const isSelected = newInternalValue.some((v: any) =>
						optionsMatch(v, foundOption),
					)

					if (foundOption && !isSelected) {
						newInternalValue.push(foundOption)
					}
				})

				newInternalValue = newInternalValue.filter(
					(option: SelectOption) =>
						newValue.some((v) => optionsMatch(v, option)),
				)
			} else {
				newInternalValue = opts.find((option) =>
					optionsMatch(option, newValue as string),
				)
			}
		} else {
			newInternalValue = Array.isArray(newValue)
				? newValue.map(stringOrNumberToOption)
				: stringOrNumberToOption(newValue)
		}

		setValue(newInternalValue)

		if (onValueChange && !noCallback) {
			onValueChange(newInternalValue)
		}
	}
	/* eslint-enable @typescript-eslint/no-explicit-any */

	return (
		<SelectContext.Provider
			value={{
				options: opts,
				value,
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
	'defaultValue' | 'value'
> & {
	checkType?: SelectProviderProps['checkType']
	clearable?: boolean
	creatable?: boolean
	defaultValue?: T
	disabled?: boolean
	displayMode?: SelectProviderProps['displayMode']
	filterable?: boolean
	loading?: SelectProviderProps['loading']
	trigger?: React.ComponentType
	options?: SelectProviderProps['options']
	placeholder?: string
	store?: Ariakit.SelectProviderProps['store']
	value?: T
	renderValue?: (
		value: Ariakit.SelectStoreState['value'],
	) => React.ReactElement | string | null
	onValueChange?: SelectProviderProps['onValueChange']
	onCreate?: (newOptionValue: string) => void
}

export const Select = <T,>({
	checkType,
	children,
	clearable,
	creatable,
	displayMode,
	filterable,
	loading,
	store,
	value: valueProp,
	options: optionsProp,
	onValueChange,
	onCreate,
	...props
}: SelectProps<T>) => {
	const [searchValue, setSearchValue] = useState('')
	const value = valueProp ?? props.defaultValue
	const [options, setOptions] = useState(
		valueToOptions(optionsProp) as SelectOption[],
	)
	creatable = creatable || !!onCreate

	store =
		store ??
		Ariakit.useSelectStore({
			defaultValue: props.defaultValue
				? anyOptionsToStringValue(props.defaultValue)
				: undefined,
		})

	const providerProps = {
		checkType,
		clearable,
		defaultValue: props.defaultValue,
		displayMode,
		loading,
		options,
		value: valueToOptions(value) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
		onValueChange,
		setOptions,
	}

	const setStoreInternally = async (newOptions: string | string[]) => {
		store?.setValue(newOptions)
	}

	const handleCreateOption = (newOptionValue: string) => {
		setOptions([
			...options,
			{ name: newOptionValue, value: newOptionValue },
		])

		const storeValue = store?.getState().value
		const isMulti = Array.isArray(storeValue)

		// Wrapping in a timeout as a hack to wait until setOptions has finished
		// updating the options before updating the store value. Need to do this
		// because of how handleSetValue callback works.
		setTimeout(() => {
			if (isMulti) {
				setStoreInternally([...storeValue, newOptionValue])
			} else {
				setStoreInternally(newOptionValue)
			}
		})

		if (onCreate) {
			onCreate(newOptionValue)
		}
	}

	useEffect(() => {
		if (store && valueProp) {
			const storeValue = store.getState().value
			const stringValue = anyOptionsToStringValue(valueProp)

			if (!isEqual(stringValue, storeValue)) {
				setStoreInternally(stringValue)
			}
		}
	}, [valueProp])

	useEffect(() => {
		if (store && optionsProp) {
			const { value } = store.getState()
			let newOptions = valueToOptions(optionsProp) as SelectOption[]

			if (Array.isArray(newOptions) && Array.isArray(value)) {
				const missingOptions = value
					.filter(
						(v) =>
							!newOptions.some((option) =>
								optionsMatch(option, v),
							),
					)
					.map((v) => ({ name: v, value: v }))

				if (missingOptions.length) {
					newOptions = [...newOptions, ...missingOptions]
				}

				setOptions(newOptions)
			}
		}
	}, [optionsProp])

	const matches = useMemo(
		() =>
			filterable
				? matchSorter(options, searchValue, { keys: ['name', 'value'] })
				: options,
		[options, searchValue],
	)

	const hasExactMatch = useMemo(
		() =>
			filterable
				? matchSorter(matches, searchValue, {
						keys: ['name', 'value'],
						threshold: matchSorter.rankings.CASE_SENSITIVE_EQUAL,
					}).length > 0
				: false,
		[matches, searchValue],
	)

	return filterable ? (
		<Ariakit.ComboboxProvider
			resetValueOnHide
			setValue={(v) => setSearchValue(v)}
		>
			<SelectProvider {...providerProps}>
				<Provider store={store} options={options}>
					<Trigger {...props} />
					<Popover>
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
							{searchValue && !hasExactMatch && creatable && (
								<Ariakit.ComboboxItem
									className={styles.item}
									value={searchValue}
									onClick={() => {
										handleCreateOption(searchValue)
										setSearchValue('')
									}}
								>
									{/* item check only needed for spacing */}
									<ItemCheck />
									<Text
										size="small"
										weight="medium"
										color="secondaryContentOnEnabled"
									>
										{searchValue}
									</Text>
								</Ariakit.ComboboxItem>
							)}
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
					</Popover>
				</Provider>
			</SelectProvider>
		</Ariakit.ComboboxProvider>
	) : (
		<SelectProvider {...providerProps}>
			<Provider store={store} options={options}>
				<Trigger {...props} />
				<Popover>
					{Array.isArray(optionsProp)
						? options.map((option) => (
								<Option
									key={option.value}
									value={String(option.value)}
								>
									{option.name}
								</Option>
							))
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
	const { displayMode, loading, options } = useSelectContext()

	if (loading) {
		props.disabled = true
	}

	const optionsForItems = (opts: string | string[]) => {
		const items = store.getState().items

		// If we have no options or items yet, use the passed in options.
		if (!options?.length && !items.length) {
			return Array.isArray(opts)
				? opts.map(stringOrNumberToOption)
				: stringOrNumberToOption(opts)
		}

		// If no options are passed in via props, use the items registered by
		// rendering Option components.
		if (!options?.length) {
			const arrayOpts = Array.isArray(opts) ? opts : [opts]
			const matchingItems = items.filter((item) =>
				arrayOpts.some((opt) => optionsMatch(item.value!, opt)),
			)

			if (Array.isArray(opts)) {
				return itemsToOptions(matchingItems)
			} else {
				return itemToOption(matchingItems[0])
			}
		}

		const findOption = (value: string | number): SelectOption => {
			const foundOption = (options ?? [])
				.map((option) =>
					typeof option === 'string'
						? ({
								name: option,
								value: option,
							} as SelectOption)
						: option,
				)
				.find((option) => optionsMatch(option, value)) as
				| SelectOption
				| undefined

			return foundOption ?? stringOrNumberToOption(value)
		}

		return Array.isArray(opts) ? opts.map(findOption) : findOption(opts)
	}

	const renderSelectValue = (
		selectValue: Ariakit.SelectStoreState['value'],
	) => {
		if (renderValue) {
			return renderValue(selectValue)
		}

		const selectedOptions = optionsForItems(selectValue)

		if (displayMode === 'tags') {
			if (
				!selectedOptions ||
				(Array.isArray(selectedOptions) && !selectedOptions.length)
			) {
				return 'Select...'
			}

			return (
				<Stack
					direction="row"
					align="center"
					gap="6"
					flexWrap={'wrap'}
					whiteSpace={'normal'}
					width="full"
				>
					{Array.isArray(selectedOptions) ? (
						selectedOptions.map((o) => (
							<SelectTag key={o.value} value={o.value}>
								{o.name}
							</SelectTag>
						))
					) : (
						<SelectTag value={selectedOptions.value}>
							{selectedOptions.name}
						</SelectTag>
					)}
				</Stack>
			)
		}

		if (Array.isArray(selectedOptions)) {
			return selectedOptions.length
				? selectedOptions.map((o) => o.name).join(', ')
				: 'Select...'
		}

		return selectedOptions.name
	}

	return (
		<Component style={{ opacity: props.disabled ? 0.7 : 1 }} {...props}>
			{value ? (
				renderSelectValue(value)
			) : (
				<Text color="secondaryContentOnEnabled">
					{props.placeholder ?? 'Select...'}
				</Text>
			)}
		</Component>
	)
}

type ProviderProps = Ariakit.SelectProviderProps & {
	store: Ariakit.SelectStore<Ariakit.SelectStoreState['value']>
	options?: SelectOption[] | undefined
}
export const Provider: React.FC<ProviderProps> = ({ children, ...props }) => {
	const { value, setOptions, setValue } = useSelectContext()
	const items = props.store.useState('items')

	useEffect(() => {
		if (setOptions && !props.options && items.length) {
			// If we have no options passed, create them from the items which were
			// registered by the Option component.
			setOptions(itemsToOptions(items))
		}
	}, [items])

	return (
		<Ariakit.SelectProvider
			value={anyOptionsToStringValue(value)}
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
	const { clearable, value, setValue } = useSelectContext()
	const isMulti = Array.isArray(value)
	const clearRef = useRef<HTMLButtonElement>(null)

	return (
		<Ariakit.Select
			className={styles.select}
			{...props}
			toggleOnPress={(e) => {
				if (
					clearRef.current?.contains(e.target as Node) ||
					clearRef.current === e.target
				) {
					return false
				}

				return true
			}}
		>
			<Stack
				direction="row"
				align="center"
				justify="space-between"
				width="full"
			>
				{typeof children === 'string' ? (
					<Text
						color="secondaryContentOnEnabled"
						lines="1"
						align="left"
					>
						{children}
					</Text>
				) : (
					children
				)}

				<Stack direction="row" align="center" gap="6">
					{clearable && (isMulti ? value.length > 0 : !!value) && (
						<ButtonIcon
							ref={clearRef}
							icon={<IconSolidXCircle />}
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()

								Array.isArray(value)
									? setValue!([])
									: setValue!(undefined)
							}}
							size="xSmall"
							emphasis="none"
							kind="secondary"
						/>
					)}

					{!hideArrow && (
						<Ariakit.SelectArrow
							render={
								<IconSolidSelector
									color={themeVars.static.content.moderate}
								/>
							}
						/>
					)}
				</Stack>
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

// Could improve the types by allow value to receive a number as well as a
// string. Would probably need to do something with manually registering items
// in options because Ariakit.SelectItem only accepts a string value.
export type OptionProps = Ariakit.SelectItemProps
export const Option: React.FC<OptionProps> = ({
	children,
	value,
	...props
}) => {
	const valuesToMatch = [value]

	if (typeof children === 'string') {
		valuesToMatch.push(children)

		if (value === undefined) {
			value = children
		}
	}

	const storeValue = Ariakit.useSelectContext()!.useState('value')
	const selected = Array.isArray(storeValue)
		? valuesToMatch.some((v) => storeValue.includes(v!))
		: valuesToMatch.includes(storeValue)

	return (
		<Ariakit.SelectItem
			focusOnHover
			value={value}
			className={styles.item}
			{...props}
		>
			<ItemCheck checked={selected} />
			{children ? (
				typeof children === 'string' ? (
					<Text
						size="small"
						weight="medium"
						color="secondaryContentOnEnabled"
					>
						{children}
					</Text>
				) : (
					children
				)
			) : (
				<Text
					size="small"
					weight="medium"
					color="secondaryContentOnEnabled"
				>
					{value}
				</Text>
			)}
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

const isOption = (value: SingleValue): value is SelectOption => {
	return value !== null && typeof value === 'object'
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
const valueToOptions = (value: any | undefined) => {
	if (value === undefined) {
		return
	}

	if (Array.isArray(value)) {
		return value.map(singleValueToOption)
	}

	return singleValueToOption(value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const optionToStringValue = (option: any | undefined) => {
	if (option === undefined) {
		return ''
	}

	if (isOption(option)) {
		return String(option.value)
	} else {
		return String(option)
	}
}

const itemsToOptions = (items: Ariakit.SelectStoreState['items']) => {
	return items.map(itemToOption)
}

const itemToOption = (
	item: Ariakit.SelectStoreState['items'][0],
): SelectOption => {
	return {
		name: String(item.element?.innerText ?? item.value),
		value: item.value!,
	}
}

const stringOrNumberToOption = (value: string | number): SelectOption => {
	return {
		name: String(value),
		value,
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyOptionsToStringValue = (options: any[] | any | undefined) => {
	if (Array.isArray(options)) {
		return options.map(optionToStringValue)
	}

	return optionToStringValue(options)
}

const optionsMatch = (
	option: string | number | SelectOption,
	searchValue: string | number | SelectOption | undefined,
): boolean => {
	if (searchValue === undefined) {
		return false
	}

	if (isOption(option) && isOption(searchValue)) {
		const optionValues = [option.value, option.name].map(String)
		const searchValues = [searchValue.value, searchValue.name].map(String)
		return optionValues.some((v) => searchValues.includes(v))
	} else if (isOption(option)) {
		const optionValues = [option.value, option.name].map(String)
		return optionValues.includes(String(searchValue))
	} else if (isOption(searchValue)) {
		const searchValues = [searchValue.value, searchValue.name].map(String)
		return searchValues.includes(String(option))
	}

	return String(option) === String(searchValue)
}

const SelectTag: React.FC<{ children: string; value: string | number }> = ({
	children,
	value,
}) => {
	const selectStore = Ariakit.useSelectContext()!
	const selectValue = selectStore.useState('value')
	const name = children

	return (
		<Badge
			cursor="pointer"
			shape="basic"
			variant="white"
			size="medium"
			label={name}
			iconEnd={<IconSolidX />}
			onMouseDown={(e) => {
				e.preventDefault()
				e.stopPropagation()

				const newValue = Array.isArray(selectValue)
					? selectValue.filter(
							(v) => !optionsMatch(v, { name, value }),
						)
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
