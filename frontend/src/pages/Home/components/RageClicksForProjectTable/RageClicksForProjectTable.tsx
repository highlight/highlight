import {
	DEMO_WORKSPACE_APPLICATION_ID,
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
import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import classNames from 'classnames'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'

import ProgressBarTable from '../../../../components/ProgressBarTable/ProgressBarTable'
import Tooltip from '../../../../components/Tooltip/Tooltip'
import styles from './RageClicksForProjectTable.module.scss'

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
	>([])
	const { project_id } = useParams<{
		project_id: string
	}>()
	const projectIdRemapped =
		project_id === DEMO_WORKSPACE_APPLICATION_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id

	const { setSearchParams, setSegmentName, setSelectedSegment } =
		useSearchContext()
	const { timeRange } = useDataTimeRange()
	const history = useHistory()

	const { loading } = useGetRageClicksForProjectQuery({
		variables: {
			project_id,
			lookBackPeriod: moment
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

		return tableData.filter((row) => {
			return row.identifier.includes(filterSearchTerm)
		})
	}, [filterSearchTerm, tableData])

	useEffect(() => {
		setUpdatingData(loading)
	}, [setUpdatingData, loading])

	return (
		<div className={classNames({ [styles.loading]: loading })}>
			<DashboardInnerTable>
				<ProgressBarTable
					loading={false}
					columns={Columns}
					data={filteredTableData}
					onClickHandler={(record) => {
						setSegmentName(null)
						setSelectedSegment(undefined)
						setSearchParams({
							...EmptySessionsSearchParams,
						})
						message.success(
							`Showing most recent session for ${record.identifier} with rage clicks.`,
						)
						history.push(
							`/${projectIdRemapped}/sessions/${record.sessionSecureId}`,
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
								{'!'}
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
						<span>{user}</span>
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
