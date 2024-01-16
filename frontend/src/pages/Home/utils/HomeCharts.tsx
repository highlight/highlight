import BarChartV2 from '@components/BarChartV2/BarCharV2'
import {
	DEMO_PROJECT_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import {
	useGetDailyErrorsCountQuery,
	useGetDailySessionsCountQuery,
} from '@graph/hooks'
import useDataTimeRange from '@hooks/useDataTimeRange'
import { SessionPageSearchParams } from '@pages/Player/utils/utils'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { dailyCountData } from '@util/dashboardCalculations'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import clsx from 'clsx'
import moment from 'moment/moment'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ResponsiveContainer } from 'recharts'

import styles from './HomeCharts.module.css'

type DailyCount = {
	date: moment.Moment
	count: number
	label: string
}

export const SessionCountGraph = ({
	setUpdatingData,
}: {
	setUpdatingData: React.Dispatch<React.SetStateAction<boolean>>
}) => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const projectIdRemapped =
		project_id === DEMO_PROJECT_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id

	const { setSearchTime, removeSelectedSegment } = useSearchContext()
	const { timeRange } = useDataTimeRange()
	const [sessionCountData, setSessionCountData] = useState<Array<DailyCount>>(
		[],
	)
	const navigate = useNavigate()

	const { loading, refetch } = useGetDailySessionsCountQuery({
		variables: {
			project_id: project_id!,
			date_range: {
				start_date: timeRange.start_date,
				end_date: timeRange.end_date,
			},
		},
		onCompleted: (response) => {
			if (response.dailySessionsCount) {
				const dateRangeData = dailyCountData(
					response.dailySessionsCount,
					Math.ceil(
						moment
							.duration(timeRange.lookback, 'minutes')
							.as('days'),
					),
				)
				const sessionCounts = dateRangeData.map((val, idx) => ({
					date: moment()
						.utc()
						.startOf('day')
						.subtract(
							moment
								.duration(timeRange.lookback, 'minutes')
								.as('days') -
								1 -
								idx,
							'days',
						),
					count: val,
					label: 'sessions',
				}))
				setSessionCountData(sessionCounts)
			}
		},
	})

	// Refetch when the project changes to handle the scenario where a user is a part of multiple projects.
	// Without this, the data shown would be for the previous project.
	useEffect(() => {
		refetch()
	}, [refetch, project_id])

	useEffect(() => {
		setUpdatingData(loading)
	}, [setUpdatingData, loading])

	return (
		<div className={clsx({ [styles.loading]: loading })}>
			<DailyChart
				data={sessionCountData}
				name="Sessions"
				onClickHandler={(payload: any) => {
					const date = moment(payload.activePayload[0].payload.date)
					removeSelectedSegment()

					setSearchTime(
						date.startOf('day').toDate(),
						date.endOf('day').toDate(),
					)

					message.success(
						`Showing sessions that were recorded on ${payload.activeLabel}`,
					)
					navigate(`/${projectIdRemapped}/sessions`)
				}}
			/>
		</div>
	)
}

export const ErrorCountGraph = ({
	setUpdatingData,
}: {
	setUpdatingData: React.Dispatch<React.SetStateAction<boolean>>
}) => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const projectIdRemapped =
		project_id === DEMO_PROJECT_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id

	const { timeRange } = useDataTimeRange()
	const [errorCountData, setErrorCountData] = useState<Array<DailyCount>>([])
	const navigate = useNavigate()

	const { loading } = useGetDailyErrorsCountQuery({
		variables: {
			project_id: project_id!,
			date_range: {
				start_date: timeRange.start_date,
				end_date: timeRange.end_date,
			},
		},
		onCompleted: (response) => {
			if (response.dailyErrorsCount) {
				const dateRangeData = dailyCountData(
					response.dailyErrorsCount,
					Math.ceil(
						moment
							.duration(timeRange.lookback, 'minutes')
							.as('days'),
					),
				)
				const errorCounts = dateRangeData.map((val, idx) => ({
					date: moment()
						.utc()
						.startOf('day')
						.subtract(
							moment
								.duration(timeRange.lookback, 'minutes')
								.as('days') -
								1 -
								idx,
							'days',
						),
					count: val,
					label: 'errors',
				}))
				setErrorCountData(errorCounts)
			}
		},
	})

	useEffect(() => {
		setUpdatingData(loading)
	}, [setUpdatingData, loading])

	return (
		<div className={clsx({ [styles.loading]: loading })}>
			<DailyChart
				data={errorCountData}
				lineColor="var(--color-orange-400)"
				name="Errors"
				onClickHandler={(payload: any) => {
					navigate(
						`/${projectIdRemapped}/errors?${
							SessionPageSearchParams.date
						}=${payload.activePayload[0].payload.date.toDate()}`,
					)
				}}
			/>
		</div>
	)
}

const DailyChart = ({
	data,
	lineColor = 'var(--color-purple)',
	name,
	onClickHandler,
}: {
	data: Array<DailyCount>
	lineColor?: string
	name: string
	onClickHandler?: any
}) => {
	return (
		<ResponsiveContainer width="100%" height={275}>
			<BarChartV2
				barSize={12}
				data={data}
				barColorMapping={{
					count: lineColor,
				}}
				xAxisDataKeyName="date"
				xAxisLabel=""
				xAxisTickFormatter={(value: number) =>
					moment(value).format('D MMM YYYY')
				}
				yAxisLabel={name}
				yAxisKeys={['count']}
				onClickHandler={onClickHandler}
			/>
		</ResponsiveContainer>
	)
}
