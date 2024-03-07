import { Select } from 'antd'
import _ from 'lodash'
import { useEffect, useMemo, useState } from 'react'

import styles from './SearchSelect.module.css'

export interface SearchOption {
	value: string
	label: string
}

export const SearchSelect = ({
	onSelect,
	options,
	loadOptions,
	value,
	valueLable,
	labelInValue = true,
	loading = false,
	placeholder = 'graphql.operation.users',
}: {
	onSelect: (name: string) => void
	options: SearchOption[]
	loadOptions: (input: string) => void
	value?: string
	placeholder?: string
	valueLable?: string
	labelInValue?: boolean
	loading?: boolean
}) => {
	return (
		<Select
			className={styles.select}
			// this mode allows using the select component as a single searchable input
			// @ts-ignore
			mode="SECRET_COMBOBOX_MODE_DO_NOT_USE"
			placeholder={placeholder}
			autoFocus
			onSelect={(newValue: SearchOption) => {
				onSelect(newValue?.value || '')
			}}
			defaultValue={
				{ label: valueLable || value, value: value } as SearchOption
			}
			options={options}
			notFoundContent={<span>`No results found`</span>}
			labelInValue={labelInValue}
			filterOption={false}
			loading={loading}
			onSearch={loadOptions}
		/>
	)
}

export const SimpleSearchSelect = ({
	onSelect,
	options,
	value,
	freeSolo,
	placeholder,
	autoFocus = true,
}: {
	onSelect: (name: string) => void
	options: string[]
	value?: string
	freeSolo?: boolean
	placeholder?: string
	autoFocus?: boolean
}) => {
	const [filteredOptions, setFilteredOptions] = useState<string[]>([])
	const [extraOption, setExtraOption] = useState<SearchOption>()

	const getValueOptions = (input: string) => {
		setFilteredOptions(
			options.filter(
				(m) => m.toLowerCase().indexOf(input.toLowerCase()) !== -1,
			) || [],
		)
	}

	const loadOptions = useMemo(
		() => _.debounce(getValueOptions, 100),
		// Ignore this so we have a consistent reference so debounce works.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[options],
	)

	// initial load of options
	useEffect(() => {
		if (!filteredOptions.length && options.length) {
			loadOptions('')
		}
	}, [loadOptions, filteredOptions, options])

	return (
		<Select
			className={styles.select}
			// this mode allows using the select component as a single searchable input
			// @ts-ignore
			mode="SECRET_COMBOBOX_MODE_DO_NOT_USE"
			placeholder={placeholder || 'graphql_operation'}
			autoFocus={autoFocus}
			onChange={(x) => {
				if (freeSolo) {
					setExtraOption(x)
				}
			}}
			onSelect={(newValue: SearchOption) => {
				onSelect(newValue?.value || '')
			}}
			defaultValue={{ label: value, value: value } as SearchOption}
			options={[
				...filteredOptions.map((s) => ({
					label: s,
					value: s,
				})),
				...(extraOption ? [extraOption] : []),
			]}
			notFoundContent={<span>No recommendations found.</span>}
			labelInValue
			filterOption={false}
			onSearch={loadOptions}
			placeho
		/>
	)
}
