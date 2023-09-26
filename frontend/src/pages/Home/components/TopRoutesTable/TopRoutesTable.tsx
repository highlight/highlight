import { ProgressBarTableRowGroup } from '@components/ProgressBarTable/components/ProgressBarTableColumns'
import { useGetNetworkHistogramQuery } from '@graph/hooks'
import { NetworkRequestAttribute } from '@graph/schemas'
import useDataTimeRange from '@hooks/useDataTimeRange'
import { DashboardInnerTable } from '@pages/Home/components/DashboardInnerTable/DashboardInnerTable'
import { useParams } from '@util/react-router/useParams'
import { ColumnsType } from 'antd/es/table'
import clsx from 'clsx'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import ProgressBarTable from '../../../../components/ProgressBarTable/ProgressBarTable'
import styles from './TopRoutesTable.module.css'

const TopRoutesTable = ({
	setUpdatingData,
}: {
	setUpdatingData: React.Dispatch<React.SetStateAction<boolean>>
}) => {
	const [tableData, setTableData] = useState<
		{
			key: number
			route: string
			count: number
		}[]
	>()
	const { project_id } = useParams<{
		project_id: string
	}>()

	const { timeRange } = useDataTimeRange()

	const { loading, data } = useGetNetworkHistogramQuery({
		variables: {
			project_id: project_id!,
			params: {
				lookback_days: moment
					.duration(timeRange.lookback, 'minutes')
					.as('days'),
				attribute: NetworkRequestAttribute.Url,
			},
		},
		skip: !project_id,
		onCompleted: (data) => {
			const transformedData =
				data?.network_histogram?.buckets
					.slice()
					.map((bucket, index) => ({
						key: index,
						route: bucket.category,
						count: bucket.count,
					})) || []
			setTableData(transformedData)
		},
		onError: () => {
			setTableData([])
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
					loading={false}
					columns={Columns}
					data={tableData}
					onClickHandler={() => {}}
					noDataMessage={
						!data?.network_histogram?.buckets.length && (
							<>
								Have you{' '}
								<Link
									to={`/${project_id}/settings/sessions#network`}
								>
									configured your backend domains?
								</Link>{' '}
								You can also call <code>H.init()</code> in your
								app{' '}
								<a
									href="https://docs.highlight.run/api/networkrecordingoptions#JTvBw"
									target="_blank"
									rel="noreferrer"
								>
									with additional{' '}
									<code>networkRecording</code> options
								</a>{' '}
								to configure this.
							</>
						)
					}
					noDataTitle="No route data yet 😔"
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
