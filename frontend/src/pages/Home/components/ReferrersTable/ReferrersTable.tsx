import {
	DEMO_PROJECT_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import {
	ProgressBarTablePercentage,
	ProgressBarTablePill,
	ProgressBarTableRowGroup,
} from '@components/ProgressBarTable/components/ProgressBarTableColumns'
import { useGetReferrersCountQuery } from '@graph/hooks'
import useDataTimeRange from '@hooks/useDataTimeRange'
import SvgReferrer from '@icons/Referrer'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { ColumnsType } from 'antd/es/table'
import clsx from 'clsx'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ProgressBarTable from '../../../../components/ProgressBarTable/ProgressBarTable'
import { DashboardInnerTable } from '../DashboardInnerTable/DashboardInnerTable'
import styles from './ReferrersTable.module.css'

const ReferrersTable = ({
	setUpdatingData,
}: {
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

	const { loading } = useGetReferrersCountQuery({
		variables: {
			project_id: project_id!,
			lookback_days: moment
				.duration(timeRange.lookback, 'minutes')
				.as('days'),
		},
		onCompleted: (data) => {
			if (data.referrers) {
				const transformedData = data.referrers.map(
					(referrer, index) => ({
						key: index,
						host: referrer?.host,
						count: referrer?.count,
						percent: (referrer?.percent || 0).toFixed(0),
					}),
				)

				setTableData(transformedData)
			}
		},
	})

	useEffect(() => {
		setUpdatingData(loading)
	}, [setUpdatingData, loading])

	if (tableData === undefined) {
		return null
	}

	return (
		<div className={clsx({ [styles.loading]: loading })}>
			<DashboardInnerTable>
				<ProgressBarTable
					columns={Columns}
					data={tableData}
					loading={false}
					onClickHandler={(record) => {
						navigate(
							`/${projectIdRemapped}/sessions?query=referrer=${record.host}`,
						)
						message.success(
							`Showing sessions that were referred by ${record.host}`,
						)
					}}
					noDataTitle="No referrer data yet 😔"
					noDataMessage="Doesn't look like your app has been referred to yet."
				/>
			</DashboardInnerTable>
		</div>
	)
}

export default ReferrersTable

const Columns: ColumnsType<any> = [
	{
		title: 'Referrers',
		dataIndex: 'host',
		key: 'host',
		render: (host) => (
			<div className={styles.hostContainer}>
				<span>{host}</span>
			</div>
		),
	},
	{
		title: 'Percentage',
		dataIndex: 'percent',
		key: 'percent',
		render: (percent, record) => {
			return (
				<ProgressBarTableRowGroup alignment="ending">
					<ProgressBarTablePercentage percent={percent} />
					<ProgressBarTablePill
						displayValue={`${record.count}`}
						icon={<SvgReferrer />}
					/>
				</ProgressBarTableRowGroup>
			)
		},
	},
]
