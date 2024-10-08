import { ComboboxSelect, Text } from '@highlight-run/ui/components'
import _ from 'lodash'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'react-use'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import {
	useGetKeysLazyQuery,
	useGetKeyValuesLazyQuery,
} from '@/graph/generated/hooks'
import { KeyType, ProductType } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'

import * as style from './styles.css'

type Props = {
	selection: string
	setSelection: (selection: string) => void
	label: string
	searchConfig: {
		productType?: ProductType
		startDate: Date
		endDate: Date
	}
	onlyNumericKeys?: boolean
	defaultKeys?: string[]
	disabled?: boolean
	placeholder?: string
}

export const Combobox: React.FC<Props> = ({
	selection,
	setSelection,
	label,
	searchConfig: { productType, startDate, endDate },
	onlyNumericKeys,
	defaultKeys,
	disabled,
	placeholder = 'Rows',
}) => {
	const { projectId } = useProjectId()
	const [getKeys, { data }] = useGetKeysLazyQuery()
	const [query, setQuery] = useState('')
	const [debouncedQuery, setDebouncedQuery] = useState('')
	useDebounce(
		() => {
			setDebouncedQuery(query)
		},
		300,
		[query],
	)

	const keyOptions = useMemo(() => {
		const baseKeys: string[] = []

		for (const key of defaultKeys || []) {
			if (key.toLowerCase().includes(query.toLowerCase())) {
				baseKeys.push(key)
			}
		}

		const searchKeys =
			_.chain(data?.keys || [])
				.map('name')
				.uniq()
				.value() ?? []

		baseKeys.concat(searchKeys).slice(0, 8)

		return baseKeys.concat(searchKeys).map((o) => ({
			key: o,
			render: o,
		}))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.keys, defaultKeys])

	useEffect(() => {
		getKeys({
			variables: {
				product_type: productType,
				project_id: projectId,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
				query: debouncedQuery,
				type: onlyNumericKeys ? KeyType.Numeric : undefined,
			},
		})
	}, [
		debouncedQuery,
		endDate,
		getKeys,
		onlyNumericKeys,
		productType,
		projectId,
		startDate,
	])

	return (
		<ComboboxSelect
			label={label}
			value={selection}
			valueRender={
				<Text cssClass={style.comboboxText}>
					{selection || placeholder}
				</Text>
			}
			options={keyOptions}
			onChange={setSelection}
			onChangeQuery={setQuery}
			cssClass={style.combobox}
			wrapperCssClass={style.comboboxWrapper}
			popoverCssClass={style.comboboxPopover}
			queryPlaceholder="Filter..."
			disabled={disabled}
		/>
	)
}

type ValueProps = {
	selection: string
	setSelection: (selection: string) => void
	label: string
	keyName: string
	searchConfig: {
		productType?: ProductType
		startDate: Date
		endDate: Date
	}
	defaultValues?: string[]
}

export const ValueCombobox: React.FC<ValueProps> = ({
	selection,
	setSelection,
	label,
	keyName,
	searchConfig: { productType, startDate, endDate },
	defaultValues,
}) => {
	const { projectId } = useProjectId()
	const [getKeyValues, { data }] = useGetKeyValuesLazyQuery()
	const [query, setQuery] = useState('')
	const [debouncedQuery, setDebouncedQuery] = useState('')
	useDebounce(
		() => {
			setDebouncedQuery(query)
		},
		300,
		[query],
	)

	const valueOptions = useMemo(() => {
		const baseKeys: string[] = []

		for (const key of defaultValues || []) {
			if (key.toLowerCase().includes(query.toLowerCase())) {
				baseKeys.push(key)
			}
		}

		const searchKeys =
			_.chain(data?.key_values || [])
				.uniq()
				.value() ?? []

		baseKeys.concat(searchKeys).slice(0, 8)

		return baseKeys.concat(searchKeys).map((o) => ({
			key: o,
			render: o,
		}))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.key_values, defaultValues])

	useEffect(() => {
		getKeyValues({
			variables: {
				product_type: productType,
				project_id: projectId,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
				query: debouncedQuery,
				key_name: keyName,
				count: 10,
			},
		})
	}, [
		debouncedQuery,
		endDate,
		getKeyValues,
		productType,
		projectId,
		startDate,
		keyName,
	])

	return (
		<ComboboxSelect
			label={label}
			value={selection}
			valueRender={
				<Text lines="1" cssClass={style.comboboxText}>
					{selection}
				</Text>
			}
			options={valueOptions}
			onChange={setSelection}
			onChangeQuery={setQuery}
			cssClass={style.combobox}
			wrapperCssClass={style.comboboxWrapper}
			queryPlaceholder="Filter..."
		/>
	)
}
