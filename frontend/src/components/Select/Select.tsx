import { colors } from '@highlight-run/ui/colors'
import {
	IconSolidCheveronDown,
	Select as UiSelect,
	SelectOption,
} from '@highlight-run/ui/components'
import clsx from 'clsx'
import React, { useMemo } from 'react'

import styles from './Select.module.css'

export interface OptionType {
	value: string
	displayValue: React.ReactNode
	disabled?: boolean
	id: string
	dropDownIcon?: React.ReactNode
}

type Props = {
	options?: OptionType[]
	value?: string | string[]
	defaultValue?: string | string[]
	onChange?: (value: string | string[], option: OptionType | OptionType[]) => void
	onSelect?: (value: string, option: OptionType) => void
	loading?: boolean
	disabled?: boolean
	placeholder?: string
	showSearch?: boolean
	onSearch?: (value: string) => void
	mode?: 'multiple' | 'tags'
	filterOption?: boolean | ((input: string, option: OptionType) => boolean)
	notFoundContent?: React.ReactNode
	autoFocus?: boolean
	size?: 'small' | 'middle' | 'large'
	className?: string
	dropdownClassName?: string
	children?: React.ReactNode
	defaultActiveFirstOption?: boolean
}

const Select = ({
	options,
	className,
	value,
	defaultValue,
	onChange,
	onSelect,
	loading,
	disabled,
	placeholder,
	showSearch,
	onSearch,
	mode,
	notFoundContent,
	autoFocus,
	...props
}: Props) => {
	const mappedOptions: SelectOption[] = useMemo(() => {
		return (
			options?.map((opt) => ({
				name: typeof opt.displayValue === 'string' ? opt.displayValue : opt.value,
				value: opt.value,
			})) ?? []
		)
	}, [options])

	const handleChange = (newValue: string | SelectOption) => {
		if (typeof newValue === 'string') {
			const option = options?.find((o) => o.value === newValue)
			if (option && onSelect) {
				onSelect(newValue, option)
			}
			if (onChange) {
				onChange(newValue, option!)
			}
		}
	}

	const isMulti = mode === 'multiple' || mode === 'tags'

	return (
		<UiSelect
			value={value ?? defaultValue}
			options={mappedOptions}
			onValueChange={handleChange}
			disabled={disabled || loading}
			filterable={showSearch}
			onSearchValueChange={onSearch}
			clearable={false}
		>
			<UiSelect.SelectTrigger
				className={clsx(styles.select, className)}
			>
				{placeholder ?? 'Select...'}
			</UiSelect.SelectTrigger>
			<UiSelect.Popover>
				{mappedOptions.map((option) => (
					<UiSelect.Option
						key={String(option.value)}
						value={String(option.value)}
					>
						{option.name}
					</UiSelect.Option>
				))}
				{mappedOptions.length === 0 && notFoundContent}
			</UiSelect.Popover>
		</UiSelect>
	)
}

export default Select
