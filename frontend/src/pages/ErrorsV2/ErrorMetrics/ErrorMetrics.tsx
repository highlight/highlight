import CategoricalBarChart from '@components/CategoricalBarChart/CategoricalBarChar'
import TimeRangePicker from '@components/TimeRangePicker/TimeRangePicker'
import { useGetErrorGroupFrequenciesQuery } from '@graph/hooks'
import { GetErrorGroupQuery } from '@graph/operations'
import {
	Box,
	Heading,
	IconInformationCircle,
	IconZigZag,
	LinkButton,
	Text,
} from '@highlight-run/ui'
import { vars } from '@highlight-run/ui/src/css/vars'
import useDataTimeRange from '@hooks/useDataTimeRange'
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

const TICK_EVERY_BUCKETS = 10
const NUM_BUCKETS_TIMELINE = 30

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
	const { timeRange, setTimeRange } = useDataTimeRange()
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
			},
			metric: 'count',
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
				<div className={styles.timePickerContainer}>
					<TimeRangePicker />
				</div>
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

					{/* Callout component */}
					<div className={styles.environmentCard}>
						<Box display="flex" flexDirection="row" gap="8">
							<div className={styles.infoIconContainer}>
								<IconInformationCircle
									color={vars.color.neutralN9}
									size={12}
								/>
							</div>
							<Box display="flex" flexDirection="column" gap="8">
								<Text
									weight="bold"
									size="medium"
									cssClass={styles.bodyTitle}
								>
									Only see one environment version?
								</Text>
								<Text
									color="neutral500"
									cssClass={styles.bodyText}
								>
									Are there sourcemaps tied to your javascript
									code? If yes, you can upload them to
									Highlight in CI/CD to get enhanced stack
									traces.
								</Text>
								<LinkButton
									kind="secondary"
									href="https://www.highlight.io/docs/product-features/environments"
									target="_blank"
								>
									Learn more
								</LinkButton>
							</Box>
						</Box>
					</div>
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
				</div>
			</Box>
		</Box>
	)
}

export default ErrorMetrics
