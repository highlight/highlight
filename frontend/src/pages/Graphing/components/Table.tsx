import {
	Box,
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
	SeriesInfo,
	useGraphSeries,
	VizId,
} from '@/pages/Graphing/components/Graph'

import * as style from './Table.css'
import useLocalStorage from '@rehooks/local-storage'
import _ from 'lodash'

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

export const MetricTable = ({
	data,
	xAxisMetric,
	viewConfig,
	disabled,
	loadExemplars,
	visualizationId,
}: InnerChartProps<TableConfig> & SeriesInfo & VizId) => {
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

	const sortedData = _.sortBy(data, (d: any) => {
		if (sortColumn === -1) {
			return d[xAxisMetric]
		}

		const seriesKey = getSeriesKey(series[sortColumn])
		return d[seriesKey]?.value
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
					<Table.Body>
						{sortedData?.map((d, i) => {
							// If every value for the bucket is null, skip this row
							if (
								viewConfig.nullHandling === 'Hide row' &&
								series
									.map((s) => getSeriesKey(s))
									.find(
										(seriesKey) =>
											d[seriesKey] !== null &&
											d[seriesKey] !== undefined,
									) === undefined
							) {
								return null
							}

							return (
								<Table.Row key={i} className={style.tableRow}>
									{showXAxisColumn && (
										<Table.Cell
											key={i}
											onClick={
												loadExemplars
													? () =>
															loadExemplars(
																d[
																	BUCKET_MIN_KEY
																],
																d[
																	BUCKET_MAX_KEY
																],
																d[GROUPS_KEY],
															)
													: undefined
											}
										>
											<Tooltip
												delayed
												trigger={
													<Text
														size="small"
														color="default"
														lines="1"
														cssClass={
															style.firstCell
														}
													>
														{xAxisTickFormatter(
															d[xAxisMetric],
														)}
													</Text>
												}
											>
												{xAxisTickFormatter(
													d[xAxisMetric],
												)}
											</Tooltip>
										</Table.Cell>
									)}
									{series.map((s, i) => {
										const seriesKey = getSeriesKey(s)
										let value = d[seriesKey]?.value

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
											value = getTickFormatter(s.column)(
												value,
											)
										}

										const groups =
											GROUPS_KEY in d
												? d[GROUPS_KEY]
												: s.groups

										return (
											<Table.Cell
												key={i}
												onClick={
													loadExemplars
														? () =>
																loadExemplars(
																	d[
																		BUCKET_MIN_KEY
																	],
																	d[
																		BUCKET_MAX_KEY
																	],
																	groups,
																)
														: undefined
												}
											>
												<Tooltip
													delayed
													trigger={
														<Text
															size="small"
															color="default"
															lines="1"
														>
															{value}
														</Text>
													}
												>
													{value}
												</Tooltip>
											</Table.Cell>
										)
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
