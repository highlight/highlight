import { useGetTracesKeysLazyQuery } from '@graph/hooks'
import {
	ComboboxSelect,
	DEFAULT_TIME_PRESETS,
	IconSolidDotsHorizontal,
} from '@highlight-run/ui/components'
import { useDebouncedValue } from '@hooks/useDebouncedValue'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { FixedRangePreset } from '@/components/Search/SearchForm/SearchForm'
import { useSearchTime } from '@/hooks/useSearchTime'

import { CustomColumn, TRACE_COLUMN_OPTIONS } from '../columns'
import * as styles from './styles.css'

type Props = {
	selectedColumns: CustomColumn[]
	setSelectedColumns: (columns: CustomColumn[]) => void
}

export const CustomColumnPopover: React.FC<Props> = ({
	selectedColumns,
	setSelectedColumns,
}) => {
	const { project_id } = useParams()
	const [query, setQuery] = useState<string>('')
	const debouncedQuery = useDebouncedValue(query) || ''

	const value = selectedColumns.map((c) => c.id)
	const { startDate, endDate } = useSearchTime({
		presets: DEFAULT_TIME_PRESETS,
		initialPreset: FixedRangePreset,
	})

	const [getKeys, { data, loading }] = useGetTracesKeysLazyQuery()

	useEffect(() => {
		if (debouncedQuery) {
			getKeys({
				variables: {
					project_id: project_id!,
					date_range: {
						start_date: moment(startDate).format(TIME_FORMAT),
						end_date: moment(endDate).format(TIME_FORMAT),
					},
					query: debouncedQuery,
				},
			})
		}
	}, [debouncedQuery, startDate, endDate, project_id, getKeys])

	const columnOptions = useMemo(() => {
		if (!data || !debouncedQuery) {
			const defaultColumns = [...selectedColumns, ...TRACE_COLUMN_OPTIONS]
			const defaultColumnHash = defaultColumns.reduce((acc, column) => {
				acc[column.id] = column

				return acc
			}, {} as Record<string, CustomColumn>)

			return Object.values(defaultColumnHash)
		}

		const { keys } = data

		return keys.map(
			(key) =>
				({
					id: convertKey(key.name),
					label: key.name,
					type: 'string',
					size: '1fr',
				} as CustomColumn),
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, debouncedQuery])

	const allColumnsHash = useMemo(() => {
		const allColumns = [...selectedColumns, ...columnOptions]

		return allColumns.reduce((acc, column) => {
			acc[column.id] = column

			return acc
		}, {} as Record<string, CustomColumn>)
	}, [selectedColumns, columnOptions])

	const comboboxOptions = useMemo(() => {
		if (loading) return []

		return columnOptions.map((o) => ({
			key: o.id,
			render: o.label,
		}))
	}, [columnOptions, loading])

	const handleColumnValueChange = (updatedValue: string[]) => {
		if (!updatedValue || !updatedValue.length) {
			return
		}
		const updatedColumns = updatedValue.map((id) => allColumnsHash[id])
		setSelectedColumns(updatedColumns)
	}

	return (
		<ComboboxSelect
			label="Selected columns"
			queryPlaceholder="Search..."
			onChange={handleColumnValueChange}
			icon={<IconSolidDotsHorizontal />}
			value={value}
			options={comboboxOptions}
			cssClass={styles.selectButton}
			onChangeQuery={setQuery}
		/>
	)
}

// snake_case to camelCase, but preserve .
// sort of brittle but trying to map returned traces keys to
// attributes in the trace attributes
const convertKey = (key: string) => {
	const newKey = key
		.replace(/(?:^\w|[A-Z]|_\w)/g, function (word, index) {
			return index === 0 ? word.toLowerCase() : word.toUpperCase()
		})
		.replace(/_/g, '')

	console.log(newKey)
	return newKey
}
