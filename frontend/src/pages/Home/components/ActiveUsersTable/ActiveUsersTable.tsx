import {
	DEMO_PROJECT_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import {
	ProgressBarTablePercentage,
	ProgressBarTablePill,
	ProgressBarTableRowGroup,
	ProgressBarTableUserAvatar,
} from '@components/ProgressBarTable/components/ProgressBarTableColumns'
import { toast } from '@components/Toaster'
import { useGetTopUsersQuery } from '@graph/hooks'
import useDataTimeRange from '@hooks/useDataTimeRange'
import SvgClockIcon from '@icons/ClockIcon'
import { getUserDisplayName } from '@pages/Home/utils/HomePageUtils'
import { useParams } from '@util/react-router/useParams'
import { validateEmail } from '@util/string'
import { ColumnsType } from 'antd/es/table'
import clsx from 'clsx'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ProgressBarTable from '../../../../components/ProgressBarTable/ProgressBarTable'
import Tooltip from '../../../../components/Tooltip/Tooltip'
import { DashboardInnerTable } from '../DashboardInnerTable/DashboardInnerTable'
import { formatShortTime } from '../KeyPerformanceIndicators/utils/utils'
import styles from './ActiveUsersTable.module.css'

const ActiveUsersTable = ({
	filterSearchTerm,
	setUpdatingData,
}: {
	filterSearchTerm: string
	setUpdatingData: React.Dispatch<React.SetStateAction<boolean>>
}) => {
	const [tableData, setTableData] = useState<any[]>()
	const { project_id } = useParams<{
		project_id: string
	}>()
	const projectIdRemapped =
		project_id === DEMO_PROJECT_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id

	const { timeRange } = useDataTimeRange()
	const navigate = useNavigate()

	const { loading } = useGetTopUsersQuery({
		variables: {
			project_id: project_id!,
			lookback_days: moment
				.duration(timeRange.lookback, 'minutes')
				.as('days'),
		},
		fetchPolicy: 'no-cache',
		onCompleted: (data) => {
			if (data.topUsers) {
				const transformedData = data.topUsers
					.slice()
					.map((topUser, index) => ({
						key: index,
						identifier: topUser?.identifier,
						total_active_time: topUser?.total_active_time,
						active_time_percentage: topUser?.active_time_percentage,
						id: topUser?.id,
						userProperties: topUser?.user_properties,
					}))

				setTableData(transformedData)
			}
		},
	})

	useEffect(() => {
		setUpdatingData(loading)
	}, [setUpdatingData, loading])

	const filteredTableData = useMemo(() => {
		if (filterSearchTerm === '') {
			return tableData
		}

		return tableData?.filter((row) => {
			return row.identifier.includes(filterSearchTerm)
		})
	}, [filterSearchTerm, tableData])

	if (filteredTableData === undefined) {
		return null
	}

	return (
		<div className={clsx({ [styles.loading]: loading })}>
			<DashboardInnerTable>
				<ProgressBarTable
					loading={false}
					columns={Columns}
					data={filteredTableData}
					onClickHandler={(record) => {
						const displayName = getUserDisplayName(record)
						const userParam = validateEmail(displayName)
							? 'email'
							: 'identifier'

						navigate({
							pathname: `/${projectIdRemapped}/sessions`,
							search: `query=${userParam}=${displayName}`,
						})

						toast.success(`Showing sessions for ${displayName}`)
					}}
					noDataMessage={
						filteredTableData.length === 0 &&
						filterSearchTerm !== '' ? (
							<>
								This table will only shows the top 50 users
								based on total active time in your app. '
								{filterSearchTerm}' is not in the top 50.
							</>
						) : (
							<>
								It doesn't look like we have any sessions with
								identified users. You will need to call{' '}
								<code>identify()</code> in your app to identify
								users during their sessions. You can{' '}
								<a
									href="https://docs.highlight.run/identifying-users"
									target="_blank"
									rel="noreferrer"
								>
									learn more here
								</a>
								.
							</>
						)
					}
					noDataTitle={
						filteredTableData.length === 0 &&
						filterSearchTerm !== ''
							? `No matches for '${filterSearchTerm}'`
							: 'No user data yet 😔'
					}
				/>
			</DashboardInnerTable>
		</div>
	)
}

export default ActiveUsersTable

const Columns: ColumnsType<any> = [
	{
		title: 'User',
		dataIndex: 'identifier',
		key: 'identifier',
		render: (user, record) => {
			return (
				<div className={styles.hostContainer}>
					<ProgressBarTableRowGroup>
						<ProgressBarTableUserAvatar
							identifier={user}
							userProperties={record.userProperties}
						/>
						<span>{getUserDisplayName(record)}</span>
					</ProgressBarTableRowGroup>
				</div>
			)
		},
	},
	{
		title: 'Percentage',
		dataIndex: 'active_time_percentage',
		key: 'active_time_percentage',
		render: (percent, record) => {
			return (
				<ProgressBarTableRowGroup alignment="ending">
					<div className={styles.timeRow}>
						<ProgressBarTablePercentage percent={percent * 100} />
						<Tooltip title="Total active time the user has spent on your app">
							<ProgressBarTablePill
								displayValue={`${formatShortTime(
									record.total_active_time / 1000,
									['d', 'h', 'm', 's'],
									'',
									1,
									true,
								)}`}
								icon={<SvgClockIcon />}
							/>
						</Tooltip>
					</div>
				</ProgressBarTableRowGroup>
			)
		},
	},
]
