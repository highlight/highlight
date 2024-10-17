import { Select } from '@highlight-run/ui/components'
import _, { isArray } from 'lodash'
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

type Props<T extends string | string[]> = {
	selection: T
	setSelection: (selection: T) => void
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

export const Combobox = <T extends string | string[]>({
	selection,
	setSelection,
	searchConfig: { productType, startDate, endDate },
	onlyNumericKeys,
	defaultKeys,
	disabled,
	placeholder,
}: Props<T>) => {
	const { projectId } = useProjectId()
	const [getKeys, { data, loading, previousData }] = useGetKeysLazyQuery()
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
			_.chain(data?.keys || previousData?.keys || [])
				.map('name')
				.uniq()
				.value() ?? []

		return baseKeys.concat(searchKeys).slice(0, 10)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.keys, previousData?.keys, defaultKeys])

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

	const showSpinner = query !== debouncedQuery || loading

	return (
		<Select
			filterable
			value={selection}
			options={keyOptions}
			onValueChange={(v) => {
				if (isArray(v)) {
					setSelection(v.map((v) => v.value) as any)
				} else {
					setSelection(v.value)
				}
			}}
			onSearchValueChange={setQuery}
			placeholder={placeholder}
			disabled={disabled}
			resultsLoading={showSpinner}
		/>
	)
}

type ValueProps = {
	selection: string[]
	setSelection: (selection: string[]) => void
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
	keyName,
	searchConfig: { productType, startDate, endDate },
	defaultValues,
}) => {
	const { projectId } = useProjectId()
	const [getKeyValues, { data, loading }] = useGetKeyValuesLazyQuery()
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

		return baseKeys.concat(searchKeys).slice(0, 10)
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

	const showSpinner = query !== debouncedQuery || loading

	return (
		<Select
			filterable
			value={selection}
			options={valueOptions}
			onValueChange={(v) => setSelection(v.map((v: any) => v.value))}
			onSearchValueChange={setQuery}
			resultsLoading={showSpinner}
		/>
	)
}
