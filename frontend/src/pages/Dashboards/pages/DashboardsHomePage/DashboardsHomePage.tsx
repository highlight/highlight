import Breadcrumb from '@components/Breadcrumb/Breadcrumb'
import Card from '@components/Card/Card'
import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import { SearchEmptyState } from '@components/SearchEmptyState/SearchEmptyState'
import Table from '@components/Table/Table'
import { useGetWorkspaceAdminsByProjectIdQuery } from '@graph/hooks'
import SvgChevronRightIcon from '@icons/ChevronRightIcon'
import AlertLastEditedBy from '@pages/Alerts/components/AlertLastEditedBy/AlertLastEditedBy'
import CreateDashboardModal from '@pages/Dashboards/components/CreateDashboardModal/CreateDashboardModal'
import { useDashboardsContext } from '@pages/Dashboards/DashboardsContext/DashboardsContext'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import alertStyles from '../../../Alerts/Alerts.module.css'

const DashboardsHomePage = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const { loading } = useGetWorkspaceAdminsByProjectIdQuery({
		variables: { project_id: project_id! },
	})
	const navigate = useNavigate()
	const { dashboards, allAdmins } = useDashboardsContext()

	useEffect(() => analytics.page('Dashboards'), [])

	return (
		<LeadAlignLayout fullWidth>
			<div>
				<Breadcrumb
					getBreadcrumbName={() => 'Dashboards'}
					linkRenderAs="h2"
				/>
				<div className={alertStyles.subTitleContainer}>
					<p>
						Dashboards allow you to visualize what's happening in
						your app.
					</p>
					<CreateDashboardModal />
				</div>

				<Card noPadding>
					<Table
						columns={TABLE_COLUMNS}
						loading={loading}
						dataSource={dashboards
							.filter((d) => d?.name !== 'Home')
							.map((d) => ({
								...d,
								allAdmins,
							}))}
						pagination={false}
						showHeader={false}
						rowHasPadding
						renderEmptyComponent={
							<SearchEmptyState
								className={alertStyles.emptyContainer}
								item="dashboards"
								customTitle={`Your project doesn't have any dashboards yet 😔`}
								customDescription={<CreateDashboardModal />}
							/>
						}
						onRow={(record) => ({
							onClick: () => {
								navigate(
									`/${project_id}/dashboards/${record.id}`,
									{
										state: {
											dashboardName: record.name,
										},
									},
								)
							},
						})}
					/>
				</Card>
			</div>
		</LeadAlignLayout>
	)
}

export default DashboardsHomePage

const TABLE_COLUMNS = [
	{
		title: 'Name',
		dataIndex: 'name',
		key: 'name',
		render: (name: string, record: any) => {
			return (
				<div className={alertStyles.nameCell} key={name}>
					<div className={alertStyles.primary}>{name}</div>
					<div>
						<AlertLastEditedBy
							adminId={record.LastAdminToEditID}
							lastEditedTimestamp={record.updated_at}
							allAdmins={record.allAdmins}
							loading={record.loading}
						/>
					</div>
				</div>
			)
		},
	},
	{
		title: 'View',
		dataIndex: 'view',
		key: 'view',
		render: (_: any, record: any) => (
			<Link
				to={`/${record.project_id}/dashboards/${record.id}`}
				state={{ dashboardName: record.name }}
				className={alertStyles.configureButton}
				onClick={(e) => {
					e.stopPropagation()
				}}
			>
				View <SvgChevronRightIcon />
			</Link>
		),
	},
]
