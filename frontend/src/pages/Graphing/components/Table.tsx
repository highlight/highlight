import {
	Box,
	IconSolidExclamationCircle,
	IconSolidSortAscending,
	IconSolidSortDescending,
	Stack,
	Table,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import clsx from 'clsx'

import {
	BUCKET_MAX_KEY,
	BUCKET_MIN_KEY,
	getSeriesKey,
	getTickFormatter,
	GROUPS_KEY,
	InnerChartProps,
	LoadExemplars,
	NamedSeries,
	SeriesInfo,
	ThresholdSettings,
	useGraphSeries,
	VizId,
} from '@/pages/Graphing/components/Graph'

import * as style from './Table.css'
import useLocalStorage from '@rehooks/local-storage'
import _, { isNumber } from 'lodash'
import { memo, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ThresholdCondition, ThresholdType } from '@/graph/generated/schemas'

export type TableNullHandling = 'Hide row' | 'Blank' | 'Zero'
export const TABLE_NULL_HANDLING: TableNullHandling[] = [
	'Hide row',
	'Blank',
	'Zero',
]

export type TableConfig = {
	type: 'Table'
	showLegend: false
	nullHandling?: TableNullHandling
}

const formatXAxisMetric = (xAxisMetric: string) => {
	if (xAxisMetric === GROUPS_KEY) {
		return 'Group'
	}
	return xAxisMetric
}

const MetricTableImpl = ({
	data,
	xAxisMetric,
	viewConfig,
	disabled,
	loadExemplars,
	visualizationId,
	thresholdSettings,
}: InnerChartProps<TableConfig> & SeriesInfo & VizId) => {
	const bodyRef = useRef<HTMLDivElement>(null)

	const series = useGraphSeries(data, xAxisMetric)
	const xAxisTickFormatter = getTickFormatter(xAxisMetric)

	const showXAxisColumn =
		xAxisMetric !== GROUPS_KEY || (data && data?.length > 1)

	const [sortAsc, setSortAsc] = useLocalStorage<boolean>(
		`sort-asc-${visualizationId}`,
		true,
	)
	const [sortColumn, setSortColumn] = useLocalStorage<number>(
		`sort-col-${visualizationId}`,
		-1,
	)

	const onSort = (colIdx: number) => () => {
		if (sortColumn === colIdx) {
			setSortAsc(!sortAsc)
		} else {
			setSortColumn(colIdx)
		}
	}

	const sortIcon = sortAsc ? (
		<IconSolidSortAscending size={14} />
	) : (
		<IconSolidSortDescending size={14} />
	)

	const orderedData = useMemo(() => {
		const sortedData = _.sortBy(data, (d: any) => {
			if (sortColumn === -1) {
				return d[xAxisMetric]
			}

			const seriesKey = getSeriesKey(series[sortColumn])
			return d[seriesKey]?.value
		})

		const filteredData = sortedData.filter((d) => {
			// If every value for the bucket is null, skip this row
			return (
				viewConfig.nullHandling !== 'Hide row' ||
				series
					.map((s) => getSeriesKey(s))
					.find(
						(seriesKey) =>
							d[seriesKey] !== null && d[seriesKey] !== undefined,
					) !== undefined
			)
		})

		return sortAsc ? filteredData : filteredData.reverse()
	}, [
		data,
		series,
		sortAsc,
		sortColumn,
		viewConfig.nullHandling,
		xAxisMetric,
	])

	const rowVirtualizer = useVirtualizer({
		count: orderedData?.length,
		estimateSize: () => 25,
		getScrollElement: () => bodyRef.current,
		overscan: 50,
	})

	const virtualRows = rowVirtualizer.getVirtualItems()

	return (
		<Box height="full" cssClass={style.tableWrapper}>
			<Table noBorder className={style.fullHeight}>
				<Table.Head className={style.tableHeader}>
					<Table.Row className={style.tableRow}>
						{showXAxisColumn && (
							<Table.Header onClick={onSort(-1)}>
								<Stack
									direction="row"
									width="full"
									justifyContent="space-between"
									alignItems="center"
								>
									<Text lines="1" cssClass={style.firstCell}>
										{formatXAxisMetric(xAxisMetric)}
									</Text>
									{sortColumn === -1 && sortIcon}
								</Stack>
							</Table.Header>
						)}
						{series.map((s, i) => (
							<Table.Header onClick={onSort(i)} key={i}>
								<Stack
									direction="row"
									width="full"
									justifyContent="space-between"
									alignItems="center"
								>
									<Text lines="1">{s.name}</Text>
									{sortColumn === i && sortIcon}
								</Stack>
							</Table.Header>
						))}
					</Table.Row>
				</Table.Head>
				<Box
					height="full"
					cssClass={clsx(style.scrollableBody, {
						[style.preventScroll]: disabled,
					})}
				>
					<Table.Body ref={bodyRef}>
						{virtualRows?.map((virtualRow) => {
							const d = orderedData[virtualRow.index]

							return (
								<MetricTableRow
									row={d}
									key={virtualRow.index}
									showXAxisColumn={showXAxisColumn}
									loadExemplars={loadExemplars}
									xAxisTickFormatter={xAxisTickFormatter}
									xAxisMetric={xAxisMetric}
									series={series}
									nullHandling={viewConfig.nullHandling}
									thresholdSettings={thresholdSettings}
								/>
							)
						})}
					</Table.Body>
				</Box>
			</Table>
		</Box>
	)
}

export const MetricTable = memo(MetricTableImpl)

interface MetricTableRowProps {
	row: any
	showXAxisColumn?: boolean
	loadExemplars?: LoadExemplars
	xAxisTickFormatter: (value: any) => string
	xAxisMetric: string
	series: NamedSeries[]
	nullHandling?: TableNullHandling
	thresholdSettings?: ThresholdSettings
}

const MetricTableRow = ({
	row,
	showXAxisColumn,
	loadExemplars,
	xAxisTickFormatter,
	xAxisMetric,
	series,
	nullHandling,
	thresholdSettings,
}: MetricTableRowProps) => {
	const xAxisTitle = xAxisTickFormatter(row[xAxisMetric])

	return (
		<Table.Row className={style.tableRow}>
			{showXAxisColumn && (
				<Table.Cell
					onClick={
						loadExemplars
							? () =>
									loadExemplars(
										row[BUCKET_MIN_KEY],
										row[BUCKET_MAX_KEY],
										row[GROUPS_KEY],
									)
							: undefined
					}
					title={xAxisTitle}
				>
					<Text
						size="small"
						color="default"
						lines="1"
						cssClass={style.firstCell}
					>
						{xAxisTitle}
					</Text>
				</Table.Cell>
			)}
			{series.map((s, i) => {
				const seriesKey = getSeriesKey(s)
				let value = row[seriesKey]?.value

				if (value === null || value === undefined) {
					switch (nullHandling) {
						case 'Blank':
						case 'Hide row':
							value = ''
							break
						case 'Zero':
							value = 0
							break
					}
				}

				let thresholdConditionText = ''
				if (
					thresholdSettings &&
					thresholdSettings.thresholdType ===
						ThresholdType.Constant &&
					isNumber(value)
				) {
					switch (thresholdSettings.thresholdCondition) {
						case ThresholdCondition.Above:
							if (value > thresholdSettings.thresholdValue) {
								thresholdConditionText = 'above'
							}
							break
						case ThresholdCondition.Below:
							if (value < thresholdSettings.thresholdValue) {
								thresholdConditionText = 'below'
							}
							break
					}
				}

				if (value !== '') {
					value = getTickFormatter(s.column)(value)
				}

				const groups = GROUPS_KEY in row ? row[GROUPS_KEY] : s.groups

				return (
					<Table.Cell
						key={i}
						onClick={
							loadExemplars
								? () =>
										loadExemplars(
											row[BUCKET_MIN_KEY],
											row[BUCKET_MAX_KEY],
											groups,
										)
								: undefined
						}
						title={value}
					>
						<Text size="small" color="default" lines="1">
							{value}
						</Text>
						{thresholdConditionText && (
							<Tooltip
								trigger={
									<IconSolidExclamationCircle color="#1A1523B8" />
								}
							>
								This value is {thresholdConditionText} the alert
								threshold.
							</Tooltip>
						)}
					</Table.Cell>
				)
			})}
		</Table.Row>
	)
}
