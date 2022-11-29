import CategoricalBarChart from '@components/CategoricalBarChart/CategoricalBarChar'
import { useGetErrorGroupFrequenciesQuery } from '@graph/hooks'
import { GetErrorGroupQuery } from '@graph/operations'
import { Box, Heading, Text } from '@highlight-run/ui'
import { IconZigZag } from '@highlight-run/ui'
import moment from 'moment'
import React, { useEffect, useState } from 'react'

import styles from './ErrorMetrics.module.scss'

type Props = {
	errorGroup: GetErrorGroupQuery['error_group']
}

type FrequencyDataPoint = {
	date: string | undefined
	// TODO(spenny): dynamically set "Occurrances" key when multiple counts supported
	Occurrances: number | undefined
}

type TimelineTickInfo = {
	ticks: string[]
	format: string
}

const TICK_FORMAT = 'D MMM'
const TICK_EVERY_BUCKETS = 15
const NUM_BUCKETS_TIMELINE = 30
// TODO(spenny): allow user selected timeframe in follow up
const NUMBER_OF_DAYS = 30
const LOOKBACK_MINUTES = 24 * 60 * NUMBER_OF_DAYS

// TODO(spenny): dynamically set colors when multiple counts supported
const LINE_COLORS = {
	Occurrances: '#6b48c7',
}

const ErrorMetrics: React.FC<Props> = ({ errorGroup }) => {
	const [errorFrequencyData, setErrorFrequencyData] = useState<
		FrequencyDataPoint[]
	>([])
	const [errorFrequencyTotal, setErrorFrequencyTotal] = useState(0)
	const [timelineTicks, setTimelineTicks] = useState<TimelineTickInfo>({
		ticks: [],
		format: '',
	})

	const { data: frequencies } = useGetErrorGroupFrequenciesQuery({
		variables: {
			project_id: `${errorGroup?.project_id}`,
			error_group_secure_ids: [errorGroup?.secure_id || ''],
			params: {
				date_range: {
					start_date: moment()
						.subtract(NUMBER_OF_DAYS, 'days')
						.format(),
					end_date: moment().format(),
				},
				resolution_hours: LOOKBACK_MINUTES / 60 / NUM_BUCKETS_TIMELINE,
			},
			metric: 'count',
		},
		skip: !errorGroup?.secure_id,
	})

	const buildTimelineTicks = () => {
		const ticks: string[] = []
		const seenDays: Set<string> = new Set<string>()
		let lastDate: moment.Moment | undefined = undefined

		for (const dataPoint of frequencies?.errorGroupFrequencies || []) {
			const pointDate = dataPoint?.date
			if (pointDate) {
				const newDate = moment(pointDate)
				if (
					lastDate &&
					newDate.diff(lastDate, 'minutes') <
						(LOOKBACK_MINUTES / NUM_BUCKETS_TIMELINE) *
							TICK_EVERY_BUCKETS
				) {
					continue
				}
				lastDate = moment(newDate)
				const formattedDate = newDate.format(TICK_FORMAT)
				if (!seenDays.has(formattedDate)) {
					ticks.push(pointDate)
					seenDays.add(formattedDate)
				}
			}
		}
		setTimelineTicks({ ticks, format: TICK_FORMAT })
	}

	const buildFormatedData = () => {
		const dataSet = frequencies?.errorGroupFrequencies || []
		let runningTotal = 0
		const newErrorFrequencyData: FrequencyDataPoint[] = []

		dataSet.forEach((dataPoint) => {
			runningTotal += dataPoint?.value || 0
			// TODO(spenny): dynamically set "Occurrances" key when multiple counts supported
			newErrorFrequencyData.push({
				date: dataPoint?.date,
				Occurrances: dataPoint?.value,
			} as FrequencyDataPoint)
		})

		setErrorFrequencyTotal(runningTotal)
		setErrorFrequencyData(newErrorFrequencyData)
	}

	useEffect(() => {
		buildTimelineTicks()
		buildFormatedData()
		// Only invoke on new data.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [frequencies?.errorGroupFrequencies])

	return (
		<Box>
			<Box mt="20" mb="32" display="flex" justifyContent="space-between">
				<Heading level="h4">Metrics</Heading>
			</Box>

			<Box mb="24" display="flex">
				<div style={{ width: '50%' }}>
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
					>
						<span className={styles.titleContainer}>
							<span className={styles.iconContainer}>
								<IconZigZag color="#6b48c7" />
							</span>
							<Text weight="bold">Total occurrances</Text>
						</span>
						<Text>{errorFrequencyTotal}</Text>
					</Box>
				</div>

				<div
					className={styles.metricsDistributionContainer}
					style={{ width: '50%' }}
				>
					<CategoricalBarChart
						syncId="errorFrequencyChart"
						data={errorFrequencyData}
						xAxisDataKeyName="date"
						xAxisTickFormatter={(tickItem) =>
							moment(tickItem).format(timelineTicks.format)
						}
						xAxisProps={{
							ticks: timelineTicks.ticks,
							tickCount: timelineTicks.ticks.length,
						}}
						yAxisLabel=""
						barColorMapping={LINE_COLORS}
						stacked
						hideLegend
					/>
				</div>
			</Box>
		</Box>
	)
}

export default ErrorMetrics
