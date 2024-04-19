import { Box, Table, Text } from '@highlight-run/ui/components'
import clsx from 'clsx'

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

	return (
		<Box height="full" cssClass={style.tableWrapper}>
			<Table noBorder className={style.fullHeight}>
				<Table.Head>
					<Table.Row>
						{showXAxisColumn && (
							<Table.Header>{xAxisMetric}</Table.Header>
						)}
						{series.map((s, i) => (
							<Table.Header key={i}>
								{showMetricFn
									? getMetricDisplay(
											yAxisMetric,
											yAxisFunction,
									  )
									: s}
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
						{data?.map((d, i) => {
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
								<Table.Row key={i}>
									{showXAxisColumn && (
										<Table.Cell key={i}>
											<Text size="small" color="default">
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
