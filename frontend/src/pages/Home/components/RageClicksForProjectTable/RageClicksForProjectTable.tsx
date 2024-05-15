import {
	DEMO_PROJECT_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import {
	ProgressBarTablePill,
	ProgressBarTableRowGroup,
	ProgressBarTableUserAvatar,
} from '@components/ProgressBarTable/components/ProgressBarTableColumns'
import { useGetRageClicksForProjectQuery } from '@graph/hooks'
import useDataTimeRange from '@hooks/useDataTimeRange'
import SvgCursorClickIcon from '@icons/CursorClickIcon'
import { DashboardInnerTable } from '@pages/Home/components/DashboardInnerTable/DashboardInnerTable'
import { getUserDisplayName } from '@pages/Home/utils/HomePageUtils'
import { useParams } from '@util/react-router/useParams'
import { validateEmail } from '@util/string'
import { message } from 'antd'
import { ColumnsType } from 'antd/es/table'
import clsx from 'clsx'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ProgressBarTable from '../../../../components/ProgressBarTable/ProgressBarTable'
import Tooltip from '../../../../components/Tooltip/Tooltip'
import styles from './RageClicksForProjectTable.module.css'

const RageClicksForProjectTable = ({
	filterSearchTerm,
	setUpdatingData,
}: {
	filterSearchTerm: string
	setUpdatingData: React.Dispatch<React.SetStateAction<boolean>>
}) => {
	const [tableData, setTableData] = useState<
		{
			key: string
			identifier: string
			sessionSecureId: string
			totalClicks: number
			userProperties: string
		}[]
	>()
	const { project_id } = useParams<{
		project_id: string
	}>()
	const projectIdRemapped =
		project_id === DEMO_PROJECT_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id

	const { timeRange } = useDataTimeRange()
	const navigate = useNavigate()

	const { loading } = useGetRageClicksForProjectQuery({
		variables: {
			project_id: project_id!,
			lookback_days: moment
				.duration(timeRange.lookback, 'minutes')
				.as('days'),
		},
		onCompleted: (data) => {
			if (data.rageClicksForProject) {
				const transformedData = data.rageClicksForProject.map(
					(rageClick) => ({
						key: rageClick.session_secure_id,
						identifier: rageClick.identifier,
						sessionSecureId: rageClick.session_secure_id,
						totalClicks: rageClick.total_clicks,
						userProperties: rageClick.user_properties,
					}),
				)

				setTableData(transformedData)
			}
		},
	})

	const filteredTableData = useMemo(() => {
		if (filterSearchTerm === '') {
			return tableData
		}

		return tableData?.filter((row) => {
			return row.identifier.includes(filterSearchTerm)
		})
	}, [filterSearchTerm, tableData])

	useEffect(() => {
		setUpdatingData(loading)
	}, [setUpdatingData, loading])

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
							pathname: `/${projectIdRemapped}/sessions/${record.sessionSecureId}`,
							search: `query=${userParam}=${displayName}`,
						})

						message.success(
							`Showing most recent session for ${displayName} with rage clicks.`,
						)
					}}
					noDataMessage={
						filteredTableData.length === 0 &&
						filterSearchTerm !== '' ? (
							<></>
						) : (
							<>
								Woohoo! There are no rage clicks for the past{' '}
								{moment
									.duration(timeRange.lookback, 'minutes')
									.humanize()}
								!
							</>
						)
					}
					noDataTitle={
						filteredTableData.length === 0 &&
						filterSearchTerm !== ''
							? `No rage clicks found from '${filterSearchTerm}' 🎉`
							: 'No rage clicks yet! 🎉'
					}
				/>
			</DashboardInnerTable>
		</div>
	)
}

export default RageClicksForProjectTable

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
		title: 'Rage Clicks',
		dataIndex: 'totalClicks',
		key: 'totalClicks',
		align: 'right',
		render: (count) => (
			<ProgressBarTableRowGroup alignment="ending">
				<Tooltip title="The number of rage clicks in the session.">
					<ProgressBarTablePill
						displayValue={`${count} clicks`}
						icon={<SvgCursorClickIcon />}
					/>
				</Tooltip>
			</ProgressBarTableRowGroup>
		),
	},
]
