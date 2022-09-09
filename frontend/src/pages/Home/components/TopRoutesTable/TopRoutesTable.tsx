import {
	DEMO_WORKSPACE_APPLICATION_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import { ProgressBarTableRowGroup } from '@components/ProgressBarTable/components/ProgressBarTableColumns'
import { useGetNetworkHistogramQuery } from '@graph/hooks'
import { NetworkRequestAttribute } from '@graph/schemas'
import useDataTimeRange from '@hooks/useDataTimeRange'
import { DashboardInnerTable } from '@pages/Home/components/DashboardInnerTable/DashboardInnerTable'
import { useParams } from '@util/react-router/useParams'
import { ColumnsType } from 'antd/lib/table'
import classNames from 'classnames'
import moment from 'moment'
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

import ProgressBarTable from '../../../../components/ProgressBarTable/ProgressBarTable'
import styles from './TopRoutesTable.module.scss'

const TopRoutesTable = ({
	setUpdatingData,
}: {
	setUpdatingData: React.Dispatch<React.SetStateAction<boolean>>
}) => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const projectIdRemapped =
		project_id === DEMO_WORKSPACE_APPLICATION_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id

	const { timeRange } = useDataTimeRange()

	const { loading, data } = useGetNetworkHistogramQuery({
		variables: {
			project_id: projectIdRemapped,
			params: {
				lookback_days: moment
					.duration(timeRange.lookback, 'minutes')
					.as('days'),
				attribute: NetworkRequestAttribute.Url,
			},
		},
	})

	useEffect(() => {
		setUpdatingData(loading)
	}, [setUpdatingData, loading])

	return (
		<div className={classNames({ [styles.loading]: loading })}>
			<DashboardInnerTable>
				<ProgressBarTable
					loading={false}
					columns={Columns}
					data={
						data?.network_histogram?.buckets
							.slice()
							.map((bucket, index) => ({
								key: index,
								route: bucket.category,
								count: bucket.count,
							})) || []
					}
					onClickHandler={() => {}}
					noDataMessage={
						!data?.network_histogram?.buckets.length && (
							<>
								Have you{' '}
								<Link
									to={`/${project_id}/settings/recording#network`}
								>
									configured your backend domains?
								</Link>
							</>
						)
					}
					noDataTitle={'No route data yet 😔'}
				/>
			</DashboardInnerTable>
		</div>
	)
}

export default TopRoutesTable

const Columns: ColumnsType<any> = [
	{
		title: 'Route',
		dataIndex: 'route',
		key: 'route',
		width: '80%',
		render: (route) => {
			return (
				<div className={styles.hostContainer}>
					<ProgressBarTableRowGroup>
						<span>{route}</span>
					</ProgressBarTableRowGroup>
				</div>
			)
		},
	},
	{
		title: 'Count',
		dataIndex: 'count',
		key: 'count',
		render: (count) => {
			return (
				<ProgressBarTableRowGroup alignment="ending">
					<span>{count.toLocaleString()}</span>
				</ProgressBarTableRowGroup>
			)
		},
	},
]
