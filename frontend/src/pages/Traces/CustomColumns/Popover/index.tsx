import { useGetTracesKeysLazyQuery } from '@graph/hooks'
import {
	Box,
	ComboboxSelect,
	DEFAULT_TIME_PRESETS,
	IconSolidDotsHorizontal,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { useDebouncedValue } from '@hooks/useDebouncedValue'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { FixedRangePreset } from '@/components/Search/SearchForm/SearchForm'
import { useSearchTime } from '@/hooks/useSearchTime'

import { CustomColumn, HIGHLIGHT_STANDARD_COLUMNS } from '../columns'
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

	const defaultColumnOptions = useMemo(() => {
		const seletedColumnHash = selectedColumns.reduce((acc, column) => {
			acc[column.id] = column

			return acc
		}, {} as Record<string, CustomColumn>)

		const defaultColumnHash = {
			...seletedColumnHash,
			...HIGHLIGHT_STANDARD_COLUMNS,
		}

		return Object.values(defaultColumnHash)
	}, [selectedColumns])

	const columnOptions = useMemo(() => {
		if (!data || !debouncedQuery) {
			return defaultColumnOptions
		}

		const { keys } = data

		return keys.map((key) => {
			const highlightKey = HIGHLIGHT_STANDARD_COLUMNS[key.name]
			if (highlightKey) {
				return highlightKey
			}

			return {
				id: key.name,
				label: key.name,
				type: 'string',
				size: '1fr',
				accessKey: `traceAttributes.${key.name}`,
			} as CustomColumn
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, debouncedQuery])

	const allColumnsHash = useMemo(() => {
		return [...selectedColumns, ...columnOptions].reduce((acc, column) => {
			acc[column.id] = column

			return acc
		}, {} as Record<string, CustomColumn>)
	}, [selectedColumns, columnOptions])

	const handleColumnValueChange = (updatedValue: string[]) => {
		if (!updatedValue || !updatedValue.length) {
			return
		}
		const updatedColumns = updatedValue.map((id) => allColumnsHash[id])
		setSelectedColumns(updatedColumns)
	}

	const options = loading
		? []
		: columnOptions.map((o) => ({
				key: o.id,
				render: (
					<Tooltip
						trigger={
							<Text lines="1" cssClass={styles.selectOption}>
								{o.id}
							</Text>
						}
					>
						<Box cssClass={styles.selectOptionTooltip}>{o.id}</Box>
					</Tooltip>
				),
		  }))

	return (
		<ComboboxSelect
			label="Selected columns"
			queryPlaceholder="Search attributes..."
			onChange={handleColumnValueChange}
			icon={<IconSolidDotsHorizontal />}
			value={value}
			options={options}
			cssClass={styles.selectButton}
			popoverCssClass={styles.selectPopover}
			onChangeQuery={setQuery}
		/>
	)
}
