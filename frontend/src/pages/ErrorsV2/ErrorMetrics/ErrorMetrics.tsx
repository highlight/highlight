import CategoricalBarChart from '@components/CategoricalBarChart/CategoricalBarChar'
import { useGetErrorGroupFrequenciesQuery } from '@graph/hooks'
import { GetErrorGroupQuery } from '@graph/operations'
import { ErrorGroupFrequenciesParamsInput } from '@graph/schemas'
import {
	Box,
	DateRangePicker,
	DateRangePreset,
	EXTENDED_TIME_PRESETS,
	Heading,
	IconSolidTrendingUp,
	presetStartDate,
	Text,
} from '@highlight-run/ui/components'
import { ErrorDistributions } from '@pages/ErrorsV2/ErrorMetrics/ErrorDistributions'
import moment from 'moment'
import React, { useCallback, useEffect, useState } from 'react'

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

interface DateRange {
	start_date: Date
	end_date: Date
}

const DEFAULT_PRESET = EXTENDED_TIME_PRESETS[4]

const ErrorMetrics: React.FC<Props> = ({ errorGroup }) => {
	const [errorFrequencyData, setErrorFrequencyData] = useState<
		FrequencyDataPoint[]
	>([])
	const [errorFrequencyTotal, setErrorFrequencyTotal] = useState(0)
	const [timelineTicks, setTimelineTicks] = useState<TimelineTickInfo>({
		ticks: [],
		format: '',
	})
	const [selectedPreset, setSelectedPreset] =
		React.useState<DateRangePreset>(DEFAULT_PRESET)

	const [timeRange, setTimeRange] = React.useState<DateRange>({
		start_date: presetStartDate(DEFAULT_PRESET),
		end_date: moment().toDate(),
	})

	const determineLookback = useCallback(() => {
		const lookback = moment
			.duration(
				moment(timeRange.end_date).diff(moment(timeRange.start_date)),
			)
			.asMinutes()
		return lookback
	}, [timeRange.end_date, timeRange.start_date])

	const [lookback, setLookback] = React.useState<number>(determineLookback())

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
					start_date: timeRange.start_date.toISOString(),
					end_date: timeRange.end_date.toISOString(),
				},
				resolution_minutes: Math.ceil(lookback / NUM_BUCKETS_TIMELINE),
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

		const tickFormat = lookback > 24 * 60 ? 'D MMM' : 'HH:mm'

		for (const dataPoint of frequencies?.errorGroupFrequencies || []) {
			const pointDate = dataPoint?.date
			if (pointDate) {
				const newDate = moment(pointDate)
				if (
					lastDate &&
					newDate.diff(lastDate, 'minutes') <
						(lookback / NUM_BUCKETS_TIMELINE) * TICK_EVERY_BUCKETS
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
			setTimeRange({
				start_date: new Date(start),
				end_date: new Date(end),
			})
		} else {
			setTimeRange({
				start_date: new Date(end),
				end_date: new Date(start),
			})
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
		setLookback(determineLookback())
	}, [determineLookback])

	return (
		<Box>
			<Box mt="20" mb="32" display="flex" justifyContent="space-between">
				<Heading level="h3">Metrics</Heading>
				<div className={styles.timePickerContainer}>
					<DateRangePicker
						selectedValue={{
							startDate: timeRange.start_date,
							endDate: timeRange.end_date,
							selectedPreset: selectedPreset,
						}}
						onDatesChange={(start, end, preset) => {
							setSelectedPreset(preset!)
							setTimeRange({
								start_date: start,
								end_date: end,
							})
						}}
						presets={EXTENDED_TIME_PRESETS}
						minDate={presetStartDate(EXTENDED_TIME_PRESETS[6])}
						kind="secondary"
						size="medium"
						emphasis="low"
					/>
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
