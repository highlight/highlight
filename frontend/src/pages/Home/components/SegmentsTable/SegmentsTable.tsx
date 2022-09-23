import {
	DEMO_WORKSPACE_APPLICATION_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import { ProgressBarTableRowGroup } from '@components/ProgressBarTable/components/ProgressBarTableColumns'
import { useGetSegmentsQuery } from '@graph/hooks'
import { DashboardInnerTable } from '@pages/Home/components/DashboardInnerTable/DashboardInnerTable'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { STARRED_SEGMENT_ID } from '@pages/Sessions/SearchSidebar/SegmentPicker/SegmentPicker'
import { useParams } from '@util/react-router/useParams'
import { ColumnsType } from 'antd/lib/table'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useHistory } from 'react-router-dom'

import ProgressBarTable from '../../../../components/ProgressBarTable/ProgressBarTable'
import styles from './SegmentsTable.module.scss'

const SegmentsTable = ({
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

	const history = useHistory()

	const { loading } = useGetSegmentsQuery({
		variables: {
			project_id: projectIdRemapped,
		},
		onCompleted: (data) => {
			if (data.segments) {
				const starredSegment = {
					id: STARRED_SEGMENT_ID,
					name: 'Starred',
				}
				const userDefinedSegments = data.segments.map((segment) => ({
					id: segment?.id,
					name: segment?.name,
				}))

				setTableData([starredSegment, ...userDefinedSegments])
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
						<>
							Create a new segment inside{' '}
							<Link to={`/${project_id}/sessions`}>sessions</Link>
							.
						</>
					}
					noDataTitle={'No segments 😔'}
				/>
			</DashboardInnerTable>
		</div>
	)
}

export default SegmentsTable

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
]
