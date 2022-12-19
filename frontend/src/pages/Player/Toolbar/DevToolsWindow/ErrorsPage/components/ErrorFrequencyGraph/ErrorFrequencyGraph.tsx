import { StandardDropdown } from '@components/Dropdown/StandardDropdown/StandardDropdown'
import { RechartTooltip } from '@components/recharts/RechartTooltip/RechartTooltip'
import { useGetDailyErrorFrequencyQuery } from '@graph/hooks'
import { ErrorGroup, Maybe } from '@graph/schemas'
import clsx from 'clsx'
import moment from 'moment'
import { useState } from 'react'
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip as RechartsTooltip,
	XAxis,
	YAxis,
} from 'recharts'

import styles from './ErrorFrequencyGraph.module.scss'

type FrequencyGraphProps = {
	errorGroup?: Maybe<Pick<ErrorGroup, 'secure_id' | 'project_id'>>
}

type ErrorFrequency = {
	date: string
	occurrences: number
}

const LookbackPeriod = 60

const timeFilter = [
	{ label: 'Last 24 hours', value: 2 },
	{ label: 'Last 7 days', value: 7 },
	{ label: 'Last 30 days', value: 30 },
	{ label: 'Last 90 days', value: 90 },
	{ label: 'This year', value: 30 * 12 },
] as const

export const ErrorFrequencyGraph: React.FC<
	React.PropsWithChildren<FrequencyGraphProps>
> = ({ errorGroup }) => {
	const [errorFrequency, setErrorFrequency] = useState<{
		errorDates: Array<ErrorFrequency>
		totalErrors: number
	}>({
		errorDates: Array(LookbackPeriod).fill(0),
		totalErrors: 0,
	})
	const [dateRangeLength, setDateRangeLength] = useState<number>(
		timeFilter[2].value,
	)

	useGetDailyErrorFrequencyQuery({
		variables: {
			project_id: `${errorGroup?.project_id}`,
			error_group_secure_id: `${errorGroup?.secure_id}`,
			date_offset: dateRangeLength - 1,
		},
		skip: !errorGroup,
		onCompleted: (response) => {
			const errorData = response.dailyErrorFrequency.map((val, idx) => ({
				date: moment()
					.startOf('day')
					.subtract(dateRangeLength - 1 - idx, 'days')
					.format('D MMM YYYY'),
				occurrences: val,
			}))
			setErrorFrequency({
				errorDates: errorData,
				totalErrors: response.dailyErrorFrequency.reduce(
					(acc, val) => acc + val,
					0,
				),
			})
		},
	})

	return (
		<>
			<div
				className={clsx(styles.titleWithAction, styles.titleWithMargin)}
			>
				<h3>Error Frequency</h3>
				<StandardDropdown
					data={timeFilter}
					defaultValue={timeFilter[2]}
					onSelect={setDateRangeLength}
					disabled={!errorGroup}
				/>
			</div>
			<div className={clsx(styles.section, styles.graphSection)}>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart
						width={500}
						height={300}
						data={errorFrequency.errorDates}
						margin={{
							top: 5,
							right: 10,
							left: 10,
							bottom: 0,
						}}
					>
						<CartesianGrid stroke="#D9D9D9" vertical={false} />
						<XAxis
							dataKey="date"
							tick={false}
							axisLine={{ stroke: '#D9D9D9' }}
						/>
						<YAxis
							tickCount={10}
							interval="preserveStart"
							allowDecimals={false}
							hide={true}
						/>
						<RechartsTooltip content={<RechartTooltip />} />
						<Bar dataKey="occurrences" radius={[2, 2, 0, 0]}>
							{errorFrequency.errorDates.map((e, i) => (
								<Cell
									key={i}
									fill={
										e.occurrences >
										Math.max(
											errorFrequency.totalErrors * 0.1,
											10,
										)
											? 'var(--color-red-500)'
											: 'var(--color-brown)'
									}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
				<div className={styles.graphLabels}>
					<div>{`Total Occurrences: ${errorFrequency.totalErrors}`}</div>
				</div>
			</div>
		</>
	)
}
