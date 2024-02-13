import CategoricalBarChart from '@components/CategoricalBarChart/CategoricalBarChar'
import TimeRangePicker from '@components/TimeRangePicker/TimeRangePicker'
import { useGetErrorGroupFrequenciesQuery } from '@graph/hooks'
import { GetErrorGroupQuery } from '@graph/operations'
import { ErrorGroupFrequenciesParamsInput } from '@graph/schemas'
import {
	Box,
	Heading,
	IconSolidTrendingUp,
	Text,
} from '@highlight-run/ui/components'
import useDataTimeRange from '@hooks/useDataTimeRange'
import { ErrorDistributions } from '@pages/ErrorsV2/ErrorMetrics/ErrorDistributions'
import moment from 'moment'
import React, { useEffect, useState } from 'react'

import analytics from '@/util/analytics'

import styles from './ErrorMetrics.module.css'

type Props = {
	errorGroup: GetErrorGroupQuery['error_group']
}

type FrequencyDataPoint = {
	date: string | undefined
	// TODO(spenny): dynamically set "Occurrences" key when multiple counts supported
	Occurrences: number | undefined
}

type TimelineTickInfo = {
	ticks: string[]
	format: string
}

const TICK_EVERY_BUCKETS = 10
const NUM_BUCKETS_TIMELINE = 30

// TODO(spenny): dynamically set colors when multiple counts supported
const LINE_COLORS = {
	Occurrences: '#6b48c7',
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
	const { timeRange, setTimeRange, resetTimeRange } = useDataTimeRange()
	const [referenceArea, setReferenceArea] = useState<{
		start: string
		end: string
	}>({ start: '', end: '' })

	const { data: frequencies } = useGetErrorGroupFrequenciesQuery({
		variables: {
			project_id: `${errorGroup?.project_id}`,
			error_group_secure_ids: [errorGroup?.secure_id || ''],
			params: {
				date_range: {
					start_date: timeRange.start_date,
					end_date: timeRange.end_date,
				},
				resolution_minutes: Math.ceil(
					timeRange.lookback / NUM_BUCKETS_TIMELINE,
				),
			} as ErrorGroupFrequenciesParamsInput,
			metric: 'count',
			use_clickhouse: true,
		},
		skip: !errorGroup?.secure_id,
	})

	const buildTimelineTicks = () => {
		const ticks: string[] = []
		const seenDays: Set<string> = new Set<string>()
		let lastDate: moment.Moment | undefined = undefined
		const tickFormat = timeRange.lookback > 24 * 60 ? 'D MMM' : 'HH:mm'

		for (const dataPoint of frequencies?.errorGroupFrequencies || []) {
			const pointDate = dataPoint?.date
			if (pointDate) {
				const newDate = moment(pointDate)
				if (
					lastDate &&
					newDate.diff(lastDate, 'minutes') <
						(timeRange.lookback / NUM_BUCKETS_TIMELINE) *
							TICK_EVERY_BUCKETS
				) {
					continue
				}
				lastDate = moment(newDate)
				const formattedDate = newDate.format(tickFormat)
				if (!seenDays.has(formattedDate)) {
					ticks.push(pointDate)
					seenDays.add(formattedDate)
				}
			}
		}
		setTimelineTicks({ ticks, format: tickFormat })
	}

	const onMouseUp = () => {
		if (Object.values(referenceArea).includes('')) {
			return
		}

		const { start, end } = referenceArea

		if (end > start) {
			setTimeRange(start, end, true)
		} else {
			setTimeRange(end, start, true)
		}

		setReferenceArea({ start: '', end: '' })
	}
	const onMouseMove = (e?: any) => {
		e?.activeLabel &&
			referenceArea.start &&
			setReferenceArea({
				start: referenceArea.start,
				end: e.activeLabel,
			})
	}

	const onMouseDown = (e?: any) => {
		e?.activeLabel &&
			setReferenceArea({
				start: e.activeLabel,
				end: referenceArea.end,
			})
	}

	const buildFormatedData = () => {
		const dataSet = frequencies?.errorGroupFrequencies || []
		let runningTotal = 0
		const newErrorFrequencyData: FrequencyDataPoint[] = []

		dataSet.forEach((dataPoint) => {
			runningTotal += dataPoint?.value || 0
			// TODO(spenny): dynamically set "Occurrences" key when multiple counts supported
			newErrorFrequencyData.push({
				date: dataPoint?.date,
				Occurrences: dataPoint?.value,
			} as FrequencyDataPoint)
		})

		setErrorFrequencyTotal(runningTotal)
		setErrorFrequencyData(newErrorFrequencyData)
	}

	useEffect(() => {
		buildTimelineTicks()
		buildFormatedData()

		analytics.track('error_metrics_view', {
			errorGroupSecureId: errorGroup?.secure_id,
		})

		// Only invoke on new data.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [frequencies?.errorGroupFrequencies])

	useEffect(() => {
		resetTimeRange()
	}, [resetTimeRange])

	return (
		<Box>
			<Box mt="20" mb="32" display="flex" justifyContent="space-between">
				<Heading level="h3">Metrics</Heading>
				<div className={styles.timePickerContainer}>
					<TimeRangePicker />
				</div>
			</Box>

			<Box mb="24" display="flex" gap="28" alignItems="flex-start">
				<Box
					cssClass={styles.metricsDistributionContainer}
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
						hideYAxis
						barColorMapping={LINE_COLORS}
						referenceAreaProps={{
							x1: referenceArea.start,
							x2: referenceArea.end,
						}}
						onMouseDown={onMouseDown}
						onMouseMove={onMouseMove}
						onMouseUp={onMouseUp}
						stacked
						hideLegend
					/>
				</Box>

				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					style={{ width: '50%' }}
				>
					<span className={styles.titleContainer}>
						<span className={styles.iconContainer}>
							<IconSolidTrendingUp color="#6b48c7" />
						</span>
						<Text weight="bold">Total occurrences</Text>
					</span>
					<Text>{errorFrequencyTotal}</Text>
				</Box>
			</Box>

			<Box borderBottom="secondary" pb="16">
				<Heading level="h4">Distributions</Heading>
			</Box>
			<ErrorDistributions errorGroup={errorGroup} />
		</Box>
	)
}

export default ErrorMetrics
