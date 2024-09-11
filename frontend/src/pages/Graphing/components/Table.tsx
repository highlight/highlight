import {
	Box,
	IconSolidSortAscending,
	IconSolidSortDescending,
	Stack,
	Table,
	Text,
} from '@highlight-run/ui/components'
import clsx from 'clsx'
import _ from 'lodash'
import { useState } from 'react'

import {
	getTickFormatter,
	GROUP_KEY,
	InnerChartProps,
	SeriesInfo,
} from '@/pages/Graphing/components/Graph'

import * as style from './Table.css'

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

const getMetricDisplay = (yAxisMetric: string, yAxisFunction: string) => {
	if (yAxisFunction === 'Count') {
		return 'Count'
	}
	return `${yAxisFunction}(${yAxisMetric})`
}

export const MetricTable = ({
	data,
	xAxisMetric,
	yAxisMetric,
	yAxisFunction,
	series,
	viewConfig,
	disabled,
}: InnerChartProps<TableConfig> & SeriesInfo) => {
	const xAxisTickFormatter = getTickFormatter(xAxisMetric)
	const valueFormatter = getTickFormatter(yAxisMetric)

	const showXAxisColumn =
		xAxisMetric !== GROUP_KEY || (data && data?.length > 1)

	const showMetricFn = series.join('') === ''

	const [sortColumn, setSortColumn] = useState(-1)
	const [sortAsc, setSortAsc] = useState(true)

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

	const sortedData = _.sortBy(data, (d: any) => {
		if (sortColumn === -1) {
			return d[xAxisMetric]
		}

		return d[series[sortColumn]]
	})

	if (!sortAsc) {
		sortedData.reverse()
	}

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
										{xAxisMetric}
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
									<Text lines="1">
										{showMetricFn
											? getMetricDisplay(
													yAxisMetric,
													yAxisFunction,
												)
											: s}
									</Text>
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
					<Table.Body>
						{sortedData?.map((d, i) => {
							// If every value for the bucket is null, skip this row
							if (
								viewConfig.nullHandling === 'Hide row' &&
								series.find(
									(s) => d[s] !== null && d[s] !== undefined,
								) === undefined
							) {
								return null
							}

							return (
								<Table.Row key={i} className={style.tableRow}>
									{showXAxisColumn && (
										<Table.Cell key={i}>
											<Text
												size="small"
												color="default"
												lines="1"
												cssClass={style.firstCell}
											>
												{xAxisTickFormatter(
													d[xAxisMetric],
												)}
											</Text>
										</Table.Cell>
									)}
									{series.map((s, i) => {
										let value = d[s]

										if (
											value === null ||
											value === undefined
										) {
											switch (viewConfig.nullHandling) {
												case 'Blank':
												case 'Hide row':
													value = ''
													break
												case 'Zero':
													value = 0
													break
											}
										}

										if (value !== '') {
											value = valueFormatter(value)
										}

										const out = (
											<Table.Cell key={i}>
												<Text
													size="small"
													color="default"
													lines="1"
												>
													{value}
												</Text>
											</Table.Cell>
										)
										return out
									})}
								</Table.Row>
							)
						})}
					</Table.Body>
				</Box>
			</Table>
		</Box>
	)
}
