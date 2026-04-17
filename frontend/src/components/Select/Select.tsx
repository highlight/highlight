import { colors } from '@highlight-run/ui/colors'
import { IconSolidCheveronDown } from '@highlight-run/ui/components'
import {
	Combobox,
	ComboboxItem,
	ComboboxList,
	PopoverArrow,
	Select as AriakitSelect,
	SelectItem,
	SelectLabel,
	SelectPopover,
	useComboboxStore,
	useSelectStore,
} from '@ariakit/react'
import clsx from 'clsx'
import React, { useMemo, useState } from 'react'

import styles from './Select.module.css'

export interface OptionType {
	value: string
	displayValue: React.ReactNode
	disabled?: boolean
	id: string
	dropDownIcon?: React.ReactNode
}

type Props = {
	value?: string | string[]
	defaultValue?: string | string[]
	onChange?: (value: any) => void
	mode?: 'multiple' | 'tags'
	placeholder?: React.ReactNode
	loading?: boolean
	disabled?: boolean
	size?: 'large' | 'middle' | 'small'
	showSearch?: boolean
	filterOption?: boolean | ((input: string, option: any) => boolean)
	onSearch?: (value: string) => void
	allowClear?: boolean
	bordered?: boolean
	style?: React.CSSProperties
	className?: string
	options?: OptionType[]
	dropdownClassName?: string
	children?: React.ReactNode
	defaultActiveFirstOption?: boolean
	notFoundContent?: React.ReactNode
	getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement
	onBlur?: React.FocusEventHandler
	onFocus?: React.FocusEventHandler
	onDropdownVisibleChange?: (visible: boolean) => void
	open?: boolean
	id?: string
	tabIndex?: number
	label?: string
	suffixIcon?: React.ReactNode
	menuItemSelectedIcon?: React.ReactNode
	maxTagCount?: number | 'responsive'
	virtual?: boolean
	autoClearSearchValue?: boolean
	optionFilterProp?: string
	labelInValue?: boolean
	showArrow?: boolean
}

const Select = ({
	options,
	className,
	dropdownClassName,
	children,
	defaultActiveFirstOption = false,
	value,
	defaultValue,
	onChange,
	mode,
	placeholder,
	loading,
	disabled,
	showSearch,
	onSearch,
	open,
	onDropdownVisibleChange,
	label,
}: Props) => {
	const isMultiple = mode === 'multiple' || mode === 'tags'

	// Normalize to array of string for Ariakit
	const normalizeValue = (v: string | string[] | undefined): string | string[] => {
		if (isMultiple) {
			if (Array.isArray(v)) return v
			return v ? [v] : []
		}
		if (Array.isArray(v)) return v[0] ?? ''
		return v ?? ''
	}

	const [query, setQuery] = useState('')

	const combobox = useComboboxStore({
		setValue: (val) => {
			setQuery(val)
			onSearch?.(val)
		},
		resetValueOnHide: true,
	})

	const store = useSelectStore({
		combobox: showSearch ? combobox : undefined,
		value: open !== undefined ? normalizeValue(value) : normalizeValue(value ?? defaultValue),
		setValue: (val) => {
			onChange?.(val)
		},
		open,
		setOpen: onDropdownVisibleChange,
		defaultValue: normalizeValue(defaultValue),
	})

	// Build displayed label from selected value
	const selectedValues = store.useState('value')
	const selectedArr = Array.isArray(selectedValues)
		? selectedValues
		: selectedValues
		? [selectedValues]
		: []

	const allOptions: OptionType[] = useMemo(() => {
		if (!options) return []
		if (!showSearch || !query) return options
		return options.filter((opt) => {
			const display =
				typeof opt.displayValue === 'string'
					? opt.displayValue
					: opt.value
			return display.toLowerCase().includes(query.toLowerCase())
		})
	}, [options, query, showSearch])

	const renderTriggerLabel = () => {
		if (selectedArr.length === 0) {
			return (
				<span className={styles.placeholder}>{placeholder}</span>
			)
		}
		if (isMultiple) {
			return (
				<span className={styles.multipleValues}>
					{selectedArr.map((val) => {
						const opt = options?.find((o) => o.value === val)
						return (
							<span key={val} className={styles.tag}>
								{opt ? opt.displayValue : val}
							</span>
						)
					})}
				</span>
			)
		}
		const opt = options?.find((o) => o.value === (selectedValues as string))
		return opt ? opt.displayValue : (selectedValues as string)
	}

	return (
		<div className={clsx(styles.selectWrapper, className)}>
			{label && (
				<SelectLabel store={store} className={styles.selectLabel}>
					{label}
				</SelectLabel>
			)}
			<AriakitSelect
				store={store}
				className={clsx(styles.select, {
					[styles.disabled]: disabled || loading,
					[styles.borderless]: false,
				})}
				disabled={disabled || loading}
			>
				<span className={styles.selectInner}>
					<span className={styles.selectValue}>
						{renderTriggerLabel()}
					</span>
					<span className={styles.arrow}>
						<IconSolidCheveronDown color={colors.n9} />
					</span>
				</span>
			</AriakitSelect>
			<SelectPopover
				store={store}
				className={clsx(styles.dropdown, dropdownClassName)}
				gutter={4}
			>
				<PopoverArrow size={0} />
				{showSearch && (
					<div className={styles.searchWrapper}>
						<Combobox
							store={combobox}
							type="text"
							autoSelect
							autoComplete="none"
							placeholder="Search..."
							className={styles.searchInput}
						/>
					</div>
				)}
				<ComboboxList
					store={showSearch ? combobox : (undefined as any)}
					className={styles.optionList}
				>
					{allOptions.map(
						({ displayValue, value: optValue, disabled: optDisabled, id, dropDownIcon }) => {
							let display = displayValue
							if (dropDownIcon) {
								display = (
									<div className={styles.dropdownIcon}>
										{displayValue}{' '}
										<div className={styles.icon}>
											{dropDownIcon}
										</div>
									</div>
								)
							}

							const itemEl = (
								<SelectItem
									key={id}
									value={optValue}
									disabled={optDisabled}
									className={clsx(styles.option, {
										[styles.selected]:
											selectedArr.includes(optValue),
									})}
								>
									{display}
								</SelectItem>
							)

							return showSearch ? (
								<ComboboxItem
									key={id}
									focusOnHover
									className={styles.option}
									render={itemEl}
								/>
							) : itemEl
						},
					)}
				</ComboboxList>
				{children}
			</SelectPopover>
		</div>
	)
}

export default Select
