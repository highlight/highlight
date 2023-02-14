import {
	DEMO_WORKSPACE_APPLICATION_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import { useGetKeyPerformanceIndicatorsQuery } from '@graph/hooks'
import useDataTimeRange from '@hooks/useDataTimeRange'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { useParams } from '@util/react-router/useParams'
import { buildQueryURLString } from '@util/url/params'
import { message } from 'antd'
import clsx from 'clsx'
import moment from 'moment'
import React, { useEffect } from 'react'

import KeyPerformanceIndicator from './KeyPerformanceIndicator/KeyPerformanceIndicator'
import { formatLongNumber, formatShortTime } from './utils/utils'

const KeyPerformanceIndicators = ({
	setUpdatingData,
}: {
	setUpdatingData: React.Dispatch<React.SetStateAction<boolean>>
}) => {
	const { project_id } = useParams<{ project_id: string }>()
	const projectIdRemapped =
		project_id === DEMO_WORKSPACE_APPLICATION_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id
	const { timeRange } = useDataTimeRange()
	const { removeSelectedSegment } = useSearchContext()
	const { loading, data } = useGetKeyPerformanceIndicatorsQuery({
		variables: {
			project_id: project_id!,
			lookBackPeriod: moment
				.duration(timeRange.lookback, 'minutes')
				.as('days'),
		},
		skip: !project_id,
	})

	useEffect(() => {
		setUpdatingData(loading)
	}, [setUpdatingData, loading])

	return (
		<div
			className={clsx(
				'mb-8 flex h-full w-full flex-wrap justify-between gap-8 p-6',
				{
					['blur-xs']: loading,
				},
			)}
		>
			<KeyPerformanceIndicator
				value={formatLongNumber(data?.newUsersCount?.count || 0)}
				title="New Users"
				route={`/${projectIdRemapped}/sessions${buildQueryURLString({
					custom_first_time: true,
				})}`}
				onClick={() => {
					message.success('Showing sessions for new users')
					removeSelectedSegment()
				}}
				tooltipText={
					<>
						New users for your app that have an identity.
						<br />
						Click to see the sessions.
					</>
				}
			/>
			<KeyPerformanceIndicator
				value={formatLongNumber(data?.userFingerprintCount?.count || 0)}
				title="Devices"
				tooltipText="Devices that have used your application that don't have an identity associated with the device."
			/>
			<KeyPerformanceIndicator
				value={formatLongNumber(data?.liveUsersCount || 0)}
				title="Live Users"
				tooltipText={<>Users that are currently using your app.</>}
			/>
			<KeyPerformanceIndicator
				value={formatLongNumber(data?.unprocessedSessionsCount || 0)}
				title="Live Sessions"
				tooltipText={<>Sessions currently in progress.</>}
			/>
			<KeyPerformanceIndicator
				value={
					formatShortTime(
						(data?.averageSessionLength?.length || 0) / 1000,
					).toString() || ''
				}
				title="Average Active Time"
				tooltipText="The time spent by your users on your app across all sessions."
			/>
		</div>
	)
}

export default KeyPerformanceIndicators
