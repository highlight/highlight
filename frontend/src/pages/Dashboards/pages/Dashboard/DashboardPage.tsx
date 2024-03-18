import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import Breadcrumb from '@components/Breadcrumb/Breadcrumb'
import Button from '@components/Button/Button/Button'
import ConfirmModal from '@components/ConfirmModal/ConfirmModal'
import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import TimeRangePicker from '@components/TimeRangePicker/TimeRangePicker'
import {
	GetDashboardDefinitionsDocument,
	useDeleteDashboardMutation,
} from '@graph/hooks'
import {
	Admin,
	DashboardDefinition,
	DashboardMetricConfig,
	Maybe,
} from '@graph/schemas'
import useDataTimeRange from '@hooks/useDataTimeRange'
import PlusIcon from '@icons/PlusIcon'
import SvgTrashIcon from '@icons/TrashIcon'
import AlertLastEditedBy from '@pages/Alerts/components/AlertLastEditedBy/AlertLastEditedBy'
import DashboardCard from '@pages/Dashboards/components/DashboardCard/DashboardCard'
import { DashboardComponentCard } from '@pages/Dashboards/components/DashboardCard/DashboardComponentCard/DashboardComponentCard'
import { useDashboardsContext } from '@pages/Dashboards/DashboardsContext/DashboardsContext'
import {
	DEFAULT_SINGLE_LAYOUT,
	getDefaultMetricConfig,
	LAYOUT_CHART_WIDTH,
	LAYOUT_ROW_WIDTH,
} from '@pages/Dashboards/Metrics'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { Dropdown, Menu, message } from 'antd'
import clsx from 'clsx'
import React, { useEffect, useRef, useState } from 'react'
import { Layouts, Responsive, WidthProvider } from 'react-grid-layout'
import { VscEllipsis } from 'react-icons/vsc'
import { useLocation, useNavigate } from 'react-router-dom'

import styles from './DashboardPage.module.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

const DashboardPage = ({
	dashboardName,
	header,
	containerStyles,
}: {
	dashboardName?: string
	header?: React.ReactNode
	containerStyles?: React.CSSProperties
}) => {
	const navigate = useNavigate()
	const {
		state: locationState,
	}: {
		state: Maybe<{
			metricConfig?: DashboardMetricConfig
		}>
	} = useLocation()
	const { id } = useParams<{ id: string }>()
	const { timeRange } = useDataTimeRange()
	const { dashboards, allAdmins, updateDashboard } = useDashboardsContext()
	const [canSaveChanges, setCanSaveChanges] = useState<boolean>(false)
	const [newDashboardCardIdx, setNewDashboardCardIdx] = useState<number>()
	const [layout, setLayout] = useState<Layouts>({ lg: [] })
	const [persistedLayout, setPersistedLayout] = useState<Layouts>({ lg: [] })
	const [dashboard, setDashboard] = useState<DashboardDefinition>()
	const metricAutoAdded = useRef<boolean>(false)
	const metricConfig = locationState?.metricConfig

	useEffect(() => {
		const dashboard = dashboards.find((d) => {
			if (dashboardName) return d?.name === dashboardName
			if (id === 'web-vitals') return d?.name === 'Web Vitals'
			return d?.id === id
		})
		if (dashboard) {
			setDashboard(dashboard)
			setNewMetrics(dashboard.metrics)
			if (dashboard.layout?.length) {
				const parsedLayout = JSON.parse(dashboard.layout)
				setLayout(parsedLayout)
				setPersistedLayout(parsedLayout)
			}
		}
	}, [dashboardName, dashboards, id])

	useEffect(() => {
		setNewDashboardCardIdx(undefined)
	}, [dashboard])

	useEffect(() => analytics.page('Dashboard'), [])

	const [, setNewMetrics] = useState<DashboardMetricConfig[]>([])

	// Logic for adding a new metric based from the router state.
	useEffect(() => {
		if (!dashboard || !metricConfig || metricAutoAdded.current) {
			return
		}

		metricAutoAdded.current = true

		// Change to check both name and filters, if GraphQL request.
		const canAddMetric = !findDashboardMetric(dashboard, metricConfig)

		if (canAddMetric && metricConfig) {
			// Opens modal to edit metric config.
			setNewDashboardCardIdx(dashboard.metrics.length)

			pushNewMetricConfig([
				...dashboard.metrics,
				{
					...getDefaultMetricConfig(metricConfig.name),
					...metricConfig,
				},
			])

			// Reset state so we don't try to add again.
			navigate('', { state: {} })
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dashboard])

	const pushNewMetricConfig = (
		nm: DashboardMetricConfig[],
		newLayout?: Layouts,
	) => {
		let l: Layouts
		if (newLayout) {
			l = newLayout
		} else {
			const newPos = { ...DEFAULT_SINGLE_LAYOUT }
			newPos.i = (nm.length - 1).toString()
			newPos.y = Math.max(...layout.lg.map((l) => l.y))
			newPos.x =
				Math.max(
					...layout.lg
						.filter((l) => l.y === newPos.y)
						.map((l) => l.x),
				) + LAYOUT_CHART_WIDTH
			// wrap in case we can't fit on this current row
			if (newPos.x > LAYOUT_ROW_WIDTH - LAYOUT_CHART_WIDTH) {
				newPos.y += 1
				newPos.x = 0
			}
			l = {
				lg: [...layout.lg, newPos].slice(0, nm.length),
			}
		}
		updateDashboard({
			id: dashboard?.id || id,
			metrics: nm,
			name: dashboard?.name || '',
			layout: JSON.stringify(l),
		})
	}

	if (!dashboard) {
		return null
	}

	return (
		<LeadAlignLayout fullWidth className={styles.customLeadAlignLayout}>
			<div className={styles.dashboardPageFixedHeader}>
				<div className={styles.headerPanel}>
					{header ? (
						header
					) : (
						<div>
							<Breadcrumb
								getBreadcrumbName={(url) =>
									getDashboardsBreadcrumbNames(
										dashboard.name,
										url,
									)
								}
								linkRenderAs="h2"
							/>
						</div>
					)}
					<div className={styles.rightControllerSection}>
						<div className={styles.dateRangePickerContainer}>
							<>
								{canSaveChanges && (
									<Button
										trackingId="DashboardEditLayout"
										type="primary"
										onClick={() => {
											setCanSaveChanges(false)

											const newLayout =
												JSON.stringify(layout)

											updateDashboard({
												id: dashboard.id || id,
												name: dashboard.name,
												metrics: dashboard.metrics,
												layout: newLayout,
											})

											setPersistedLayout(layout)

											message.success(
												'Dashboard layout updated!',
												5,
											)
										}}
									>
										Save Changes
									</Button>
								)}
							</>
							<Button
								trackingId="DashboardAddLayout"
								type="ghost"
								onClick={() => {
									setNewMetrics((d) => {
										setNewDashboardCardIdx(d.length)
										const nm = [
											...d,
											getDefaultMetricConfig(''),
										]
										pushNewMetricConfig(nm)
										return nm
									})
								}}
								icon={
									<PlusIcon
										style={{ marginRight: '0.5rem' }}
									/>
								}
							>
								Add
							</Button>
							<TimeRangePicker />
							{dashboard.is_default ? null : (
								<DashboardMenu dashboard={dashboard} />
							)}
						</div>
					</div>
				</div>
				<div className={styles.headerPanel}>
					<div>
						{dashboard.last_admin_to_edit_id && (
							<AlertLastEditedBy
								adminId={dashboard.last_admin_to_edit_id.toString()}
								lastEditedTimestamp={dashboard.updated_at}
								allAdmins={
									allAdmins.filter((a) => a) as Admin[]
								}
								loading={false}
							/>
						)}
					</div>
					<div className={styles.rightControllerText}>
						Results are{' '}
						<span
							className={clsx({
								[styles.liveColored]: !timeRange.absolute,
								[styles.absoluteColored]: timeRange.absolute,
							})}
						>
							{timeRange.absolute ? ` Absolute` : ` Live`}
						</span>
					</div>
				</div>
			</div>
			<DashboardGrid
				dashboard={dashboard}
				updateDashboard={pushNewMetricConfig}
				layout={layout}
				persistedLayout={persistedLayout}
				setLayout={setLayout}
				setCanSaveChanges={setCanSaveChanges}
				newDashboardCardIdx={newDashboardCardIdx}
				containerStyles={containerStyles}
			/>
		</LeadAlignLayout>
	)
}
export default DashboardPage

function DashboardMenu({ dashboard }: { dashboard: DashboardDefinition }) {
	if (dashboard.is_default) {
		return null
	}

	return (
		<Dropdown
			trigger={['click']}
			placement="bottomRight"
			overlay={
				<Menu inlineIndent={0} className={styles.settingsDropdownMenu}>
					<Menu.Item>
						<DeleteDashboardButton dashboard={dashboard} />
					</Menu.Item>
				</Menu>
			}
		>
			<Button trackingId="dashboardPageSettings" type="ghost">
				<VscEllipsis />
			</Button>
		</Dropdown>
	)
}

export const DashboardGrid = ({
	dashboard,
	updateDashboard,
	layout,
	persistedLayout,
	setLayout,
	setCanSaveChanges,
	newDashboardCardIdx,
	containerStyles,
}: {
	dashboard: DashboardDefinition
	updateDashboard: (dm: DashboardMetricConfig[], newLayout?: Layouts) => void
	layout: Layouts
	persistedLayout: Layouts
	setLayout: React.Dispatch<React.SetStateAction<Layouts>>
	setCanSaveChanges: React.Dispatch<React.SetStateAction<boolean>>
	newDashboardCardIdx?: number
	containerStyles?: React.CSSProperties
}) => {
	const handleDashboardChange = (newLayout: ReactGridLayout.Layout[]) => {
		setLayout({ lg: newLayout })

		const newLayoutJSON = JSON.stringify(newLayout)
		const layoutJSON = JSON.stringify(persistedLayout.lg)
		setCanSaveChanges(layoutJSON !== newLayoutJSON)
	}

	const updateMetric = (idx: number, value: DashboardMetricConfig) => {
		const newMetrics = [...dashboard.metrics]
		newMetrics[idx] = {
			...dashboard.metrics[idx],
			...value,
		}
		updateDashboard(newMetrics)
	}

	const deleteMetric = (idx: number) => {
		const newMetrics = [...dashboard.metrics]
		newMetrics.splice(idx, 1)
		const lgLayout = [...layout.lg]
		lgLayout.splice(idx, 1)
		// reset new layout idxes because they should be incrementing
		const newLgLayout = []
		for (let i = 0; i < lgLayout.length; i++) {
			newLgLayout.push({
				...lgLayout[i],
				i: i.toString(),
			})
		}
		updateDashboard(newMetrics, {
			lg: newLgLayout,
		})
	}

	return (
		<div
			className={clsx(styles.gridContainer, styles.isEditing)}
			style={containerStyles}
		>
			<ResponsiveGridLayout
				useCSSTransforms={false}
				layouts={layout}
				cols={{
					lg: 12,
					md: 10,
					sm: 6,
					xs: 4,
					xxs: 2,
				}}
				breakpoints={{
					lg: 1200,
					md: 1000,
					sm: 900,
					xs: 700,
					xxs: 400,
				}}
				isDraggable
				isResizable
				containerPadding={[0, 0]}
				rowHeight={85}
				// issue in the react-grid-layout typedefs
				// @ts-ignore
				resizeHandle={(
					handle: 'se',
					ref: React.Ref<HTMLDivElement>,
				) => <div ref={ref} className={styles.resize} />}
				resizeHandles={['se']}
				draggableHandle="[data-drag-handle]"
				onDragStop={handleDashboardChange}
				onResizeStop={handleDashboardChange}
			>
				{dashboard.metrics.map((metric, index) => (
					<div key={index.toString()}>
						{!metric.component_type ? (
							<DashboardCard
								metricIdx={index}
								metricConfig={metric}
								updateMetric={updateMetric}
								deleteMetric={deleteMetric}
								key={metric.name}
								editModalShown={index === newDashboardCardIdx}
							/>
						) : (
							<DashboardComponentCard metricConfig={metric} />
						)}
					</div>
				))}
			</ResponsiveGridLayout>
		</div>
	)
}

const getDashboardsBreadcrumbNames = (dashboardName: string, url: string) => {
	if (url.endsWith('/dashboards')) {
		return 'Dashboards'
	}

	return dashboardName
}

export const findDashboardMetric = (
	dashboard: Maybe<DashboardDefinition>,
	metricConfig: DashboardMetricConfig,
) => {
	return dashboard?.metrics.find((metric) => {
		let isMatch = metric.name === metricConfig.name

		if (isMatch && metricConfig.filters) {
			isMatch = metricConfig.filters?.every((f) =>
				metric.filters?.some(
					(fi) => fi.tag === f.tag && fi.value === f.value,
				),
			)
		}

		return isMatch ? metric : false
	})
}

function DeleteDashboardButton({
	dashboard,
}: {
	dashboard: {
		id: string
		name: string
		project_id: string
	}
}) {
	const navigate = useNavigate()

	const [mutate] = useDeleteDashboardMutation({
		variables: { id: dashboard.id },
		onCompleted: () => {
			navigate(`/${dashboard.project_id}/dashboards`)
		},
		refetchQueries: [GetDashboardDefinitionsDocument],
	})

	return (
		<ConfirmModal
			trackingId="DeleteDashboardModal"
			buttonText="Delete dashboard"
			buttonProps={{
				trackingId: 'DeleteDashboard',
				icon: <SvgTrashIcon style={{ marginRight: '0.5rem' }} />,
				danger: true,
				className:
					'border-transparent hover:bg-neutral-100 focus-visible:bg-neutral-100 focus:outline-none',
			}}
			modalTitleText="Are you sure you want to delete this dashboard?"
			confirmText="Delete dashboard"
			cancelText="Never mind"
			onConfirmHandler={async (actions) => {
				await mutate()
				actions.close()
			}}
		/>
	)
}
