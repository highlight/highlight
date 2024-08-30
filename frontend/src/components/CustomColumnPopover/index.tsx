import { useGetKeysLazyQuery } from '@graph/hooks'
import {
	ComboboxSelect,
	DEFAULT_TIME_PRESETS,
	IconSolidDotsHorizontal,
	Text,
} from '@highlight-run/ui/components'
import { useDebouncedValue } from '@hooks/useDebouncedValue'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'

import LoadingBox from '@/components/LoadingBox'
import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { FixedRangePreset } from '@/components/Search/SearchForm/SearchForm'
import {
	ErrorObjectNode,
	LogEdge,
	ProductType,
	Session,
	TraceEdge,
} from '@/graph/generated/schemas'
import { useSearchTime } from '@/hooks/useSearchTime'

import * as styles from './styles.css'

export const DEFAULT_COLUMN_SIZE = '1fr'

export type CustomColumn<T, TIn> = {
	id: string
	label: string
	type: TIn
	size: string
	accessor: (row: T) => any
}

type LogColumnType = 'string' | 'datetime' | 'session' | 'level' | 'body'
export type LogCustomColumn = CustomColumn<LogEdge, LogColumnType>

type TraceColumnType =
	| 'string'
	| 'datetime'
	| 'session'
	| 'duration'
	| 'boolean'
	| 'metric_name'
	| 'metric_value'
export type TraceCustomColumn = CustomColumn<TraceEdge, TraceColumnType>

type SessionColumnType = 'string' | 'datetime' | 'session' | 'duration'
export type SessionCustomColumn = CustomColumn<Session, SessionColumnType>

type ErrorObjectColumnType = 'string' | 'datetime' | 'session' | 'error_object'
export type ErrorObjectCustomColumn = CustomColumn<
	ErrorObjectNode,
	ErrorObjectColumnType
>

export type ValidCustomColumn = CustomColumn<any, any>
export type SerializedColumn = Pick<
	CustomColumn<any, any>,
	'id' | 'size' | 'label'
>

type Props<T> = {
	attributeAccessor: (row: T) => any
	productType: ProductType
	selectedColumns: SerializedColumn[]
	standardColumns: Record<string, SerializedColumn>
	setSelectedColumns: (columns: SerializedColumn[]) => void
}

export const CustomColumnPopover = <T,>({
	attributeAccessor,
	productType,
	selectedColumns,
	standardColumns,
	setSelectedColumns,
}: Props<T>) => {
	const { project_id } = useParams()
	const [query, setQuery] = useState<string>('')
	const debouncedQuery = useDebouncedValue(query) || ''

	const value = selectedColumns.map((c) => c.id)
	const { startDate, endDate } = useSearchTime({
		presets: DEFAULT_TIME_PRESETS,
		initialPreset: FixedRangePreset,
	})

	const [getKeys, { data, loading }] = useGetKeysLazyQuery()

	useEffect(() => {
		if (debouncedQuery) {
			getKeys({
				variables: {
					product_type: productType,
					project_id: project_id!,
					date_range: {
						start_date: moment(startDate).format(TIME_FORMAT),
						end_date: moment(endDate).format(TIME_FORMAT),
					},
					query: debouncedQuery,
				},
			})
		}
	}, [debouncedQuery, startDate, endDate, productType, project_id, getKeys])

	const defaultColumnOptions = useMemo(() => {
		const seletedColumnHash = selectedColumns.reduce(
			(acc, column) => {
				acc[column.id] = column

				return acc
			},
			{} as Record<string, SerializedColumn>,
		)

		const defaultColumnHash = {
			...seletedColumnHash,
			...standardColumns,
		}

		return Object.values(defaultColumnHash)
	}, [selectedColumns, standardColumns])

	const columnOptions = useMemo(() => {
		if (!data || !debouncedQuery) {
			return defaultColumnOptions
		}

		const { keys } = data

		return keys.map((key) => {
			const highlightKey = standardColumns[key.name]
			if (highlightKey) {
				return highlightKey
			}

			return {
				id: key.name,
				label: key.name,
				type: 'string',
				size: DEFAULT_COLUMN_SIZE,
				accessor: (row: T) => attributeAccessor(row)[key.name],
			} as ValidCustomColumn
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, debouncedQuery, standardColumns])

	const allColumnsHash = useMemo(() => {
		return [...selectedColumns, ...columnOptions].reduce(
			(acc, column) => {
				acc[column.id] = column

				return acc
			},
			{} as Record<string, SerializedColumn>,
		)
	}, [selectedColumns, columnOptions])

	const handleColumnValueChange = (updatedValue: string[]) => {
		if (!updatedValue || !updatedValue.length) {
			return
		}
		const updatedColumns = updatedValue.map((id) => allColumnsHash[id])
		setSelectedColumns(updatedColumns)
	}

	const options = loading
		? undefined
		: columnOptions.map((o) => ({
				key: o.id,
				render: (
					<Text lines="1" cssClass={styles.selectOption} title={o.id}>
						{o.id}
					</Text>
				),
			}))

	return (
		<ComboboxSelect
			label="Selected columns"
			queryPlaceholder="Search attributes..."
			onChange={handleColumnValueChange}
			icon={<IconSolidDotsHorizontal />}
			loadingRender={<LoadingBox />}
			value={value}
			options={options}
			cssClass={styles.selectButton}
			popoverCssClass={styles.selectPopover}
			onChangeQuery={setQuery}
		/>
	)
}
