import {
	DEMO_WORKSPACE_APPLICATION_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import {
	ProgressBarTablePill,
	ProgressBarTableRowGroup,
} from '@components/ProgressBarTable/components/ProgressBarTableColumns'
import { useGetTopSegmentsQuery } from '@graph/hooks'
import useDataTimeRange from '@hooks/useDataTimeRange'
import SvgCursorClickIcon from '@icons/CursorClickIcon'
import { DashboardInnerTable } from '@pages/Home/components/DashboardInnerTable/DashboardInnerTable'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { useParams } from '@util/react-router/useParams'
import { ColumnsType } from 'antd/lib/table'
import classNames from 'classnames'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useHistory } from 'react-router-dom'

import ProgressBarTable from '../../../../components/ProgressBarTable/ProgressBarTable'
import Tooltip from '../../../../components/Tooltip/Tooltip'
import styles from './TopSegmentsTable.module.scss'

const TopSegmentsTable = ({
	setUpdatingData,
}: {
	setUpdatingData: React.Dispatch<React.SetStateAction<boolean>>
}) => {
	const [tableData, setTableData] = useState<any[]>()
	const { setSegmentName, setSelectedSegment } = useSearchContext()

	const { project_id } = useParams<{
		project_id: string
	}>()
	const projectIdRemapped =
		project_id === DEMO_WORKSPACE_APPLICATION_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id

	const { timeRange } = useDataTimeRange()
	const history = useHistory()

	const { loading, data } = useGetTopSegmentsQuery({
		variables: {
			project_id: projectIdRemapped,
			lookBackPeriod: moment
				.duration(timeRange.lookback, 'minutes')
				.as('days'),
		},
		onCompleted: (data) => {
			if (data.topSegments) {
				const transformedData = data.topSegments.map((segment) => ({
					id: segment?.id,
					name: segment?.name,
					sessionCount: segment?.session_count,
				}))

				setTableData(transformedData)
			}
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
		<div className={classNames({ [styles.loading]: loading })}>
			<DashboardInnerTable>
				<ProgressBarTable
					loading={false}
					columns={Columns}
					data={tableData}
					onClickHandler={(segment) => {
						history.push(`/${projectIdRemapped}/sessions`)
						setSegmentName(segment.name)
						setSelectedSegment({
							id: segment.id,
							value: segment.name,
						})
					}}
					noDataMessage={
						!data?.topSegments?.length && (
							<>
								Have you{' '}
								<Link
									to={`/${project_id}/settings/recording#network`}
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
					noDataTitle={'No segment data yet 😔'}
				/>
			</DashboardInnerTable>
		</div>
	)
}

export default TopSegmentsTable

const Columns: ColumnsType<any> = [
	{
		title: 'Segment',
		dataIndex: 'name',
		key: 'name',
		render: (name) => {
			return (
				<div className={styles.hostContainer}>
					<ProgressBarTableRowGroup>
						<span>{name}</span>
					</ProgressBarTableRowGroup>
				</div>
			)
		},
	},
	{
		title: 'Session Counts',
		dataIndex: 'sessionCount',
		key: 'sessionCount',
		align: 'right',
		render: (count) => (
			<ProgressBarTableRowGroup alignment="ending">
				<Tooltip title="The number of sessions for this segment.">
					<ProgressBarTablePill
						displayValue={`${count} sessions`}
						icon={<SvgCursorClickIcon />}
					/>
				</Tooltip>
			</ProgressBarTableRowGroup>
		),
	},
]
