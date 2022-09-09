import {
	DEMO_WORKSPACE_APPLICATION_ID,
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
import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import classNames from 'classnames'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

import ProgressBarTable from '../../../../components/ProgressBarTable/ProgressBarTable'
import { DashboardInnerTable } from '../DashboardInnerTable/DashboardInnerTable'
import styles from './ReferrersTable.module.scss'

const ReferrersTable = ({
	setUpdatingData,
}: {
	setUpdatingData: React.Dispatch<React.SetStateAction<boolean>>
}) => {
	const [tableData, setTableData] = useState<any[]>([])
	const { project_id } = useParams<{
		project_id: string
	}>()
	const projectIdRemapped =
		project_id === DEMO_WORKSPACE_APPLICATION_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id

	const { timeRange } = useDataTimeRange()
	const history = useHistory()
	const { setSearchParams, setSegmentName, setSelectedSegment } =
		useSearchContext()

	const { loading } = useGetReferrersCountQuery({
		variables: {
			project_id,
			lookBackPeriod: moment
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

	return (
		<div className={classNames({ [styles.loading]: loading })}>
			<DashboardInnerTable>
				<ProgressBarTable
					columns={Columns}
					data={tableData}
					loading={false}
					onClickHandler={(record) => {
						setSegmentName(null)
						setSelectedSegment(undefined)
						setSearchParams({
							...EmptySessionsSearchParams,
							referrer: record.host,
						})
						message.success(
							`Showing sessions that were referred by ${record.host}`,
						)
						history.push(`/${projectIdRemapped}/sessions`)
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
						displayValue={`${record.count} refers`}
						icon={<SvgReferrer />}
					/>
				</ProgressBarTableRowGroup>
			)
		},
	},
]
