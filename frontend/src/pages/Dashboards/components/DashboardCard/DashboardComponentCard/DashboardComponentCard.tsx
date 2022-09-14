import Button from '@components/Button/Button/Button'
import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import Input from '@components/Input/Input'
import { LoadingBar } from '@components/Loading/Loading'
import { DashboardMetricConfig, MetricViewComponentType } from '@graph/schemas'
import SvgDragIcon from '@icons/DragIcon'
import EditIcon from '@icons/EditIcon'
import { DeleteMetricFn } from '@pages/Dashboards/components/DashboardCard/DashboardCard'
import styles from '@pages/Dashboards/components/DashboardCard/DashboardCard.module.scss'
import {
	EditMetricModal,
	UpdateMetricFn,
} from '@pages/Dashboards/components/EditMetricModal/EditMetricModal'
import ActiveUsersTable from '@pages/Home/components/ActiveUsersTable/ActiveUsersTable'
import KeyPerformanceIndicators from '@pages/Home/components/KeyPerformanceIndicators/KeyPerformanceIndicators'
import RageClicksForProjectTable from '@pages/Home/components/RageClicksForProjectTable/RageClicksForProjectTable'
import ReferrersTable from '@pages/Home/components/ReferrersTable/ReferrersTable'
import TopRoutesTable from '@pages/Home/components/TopRoutesTable/TopRoutesTable'
import {
	ErrorCountGraph,
	SessionCountGraph,
} from '@pages/Home/utils/HomeCharts'
import classNames from 'classnames'
import React, { FunctionComponent, useState } from 'react'

import DashboardInnerCard from '../DashboardInnerCard/DashboardInnerCard'

export const PrebuiltComponentMap: {
	[key: string]: {
		fc: FunctionComponent<{
			filterSearchTerm: string
			setUpdatingData: React.Dispatch<React.SetStateAction<boolean>>
		}>
		hasSearch?: boolean
	}
} = {
	[MetricViewComponentType.KeyPerformanceGauge]: {
		fc: KeyPerformanceIndicators,
	},
	[MetricViewComponentType.SessionCountChart]: { fc: SessionCountGraph },
	[MetricViewComponentType.ErrorCountChart]: { fc: ErrorCountGraph },
	[MetricViewComponentType.ReferrersTable]: { fc: ReferrersTable },
	[MetricViewComponentType.ActiveUsersTable]: {
		fc: ActiveUsersTable,
		hasSearch: true,
	},
	[MetricViewComponentType.RageClicksTable]: {
		fc: RageClicksForProjectTable,
		hasSearch: true,
	},
	[MetricViewComponentType.TopRoutesTable]: { fc: TopRoutesTable },
}

export const DashboardComponentCard = ({
	metricIdx,
	metricConfig,
	updateMetric,
}: {
	metricIdx: number
	metricConfig: DashboardMetricConfig
	updateMetric: UpdateMetricFn
	deleteMetric: DeleteMetricFn
}) => {
	const [updatingData, setUpdatingData] = useState<boolean>(false)
	const [showEditModal, setShowEditModal] = useState<boolean>(false)
	const [filterSearchTerm, setFilterSearchTerm] = useState<string>('')
	const componentType = metricConfig.component_type
	if (!componentType) {
		return null
	}
	return (
		<DashboardInnerCard
			interactable
			className={styles.card}
			title={
				<div className="relative">
					<div className={styles.mainHeaderContent}>
						<div className={styles.headerContainer}>
							<span className={styles.header}>
								{metricConfig.description ||
									metricConfig.name ||
									'New Chart'}
								{metricConfig.help_article && (
									<InfoTooltip
										className={styles.infoTooltip}
										title={
											'Click to learn more about this metric.'
										}
										onClick={() => {
											if (metricConfig.help_article) {
												window.open(
													metricConfig.help_article,
													'_blank',
												)
											}
										}}
									/>
								)}
							</span>
						</div>
						<div className="flex justify-end gap-2 align-middle">
							{PrebuiltComponentMap[componentType].hasSearch && (
								<div
									style={{
										width: 150,
										height: 24,
									}}
								>
									<Input
										allowClear
										placeholder="Search ..."
										value={filterSearchTerm}
										onChange={(event) => {
											setFilterSearchTerm(
												event.target.value,
											)
										}}
										size="small"
									/>
								</div>
							)}
							<Button
								className={'flex justify-center'}
								icon={<EditIcon />}
								style={{ width: 40, height: 32 }}
								trackingId={'DashboardCardEditMetric'}
								onClick={() => {
									setShowEditModal(true)
								}}
							/>
							<div
								className={classNames(styles.draggable)}
								data-drag-handle=""
							>
								<SvgDragIcon />
							</div>
						</div>
					</div>
					{updatingData && (
						<div className="absolute inset-x-0 bottom-0">
							<LoadingBar height={2} width={'100%'} />
						</div>
					)}
				</div>
			}
		>
			<div className={classNames(styles.card, styles.componentCard)}>
				<EditMetricModal
					shown={showEditModal}
					onCancel={() => {
						setShowEditModal(false)
					}}
					metricConfig={metricConfig}
					metricIdx={metricIdx}
					updateMetric={updateMetric}
					canChangeType={false}
				/>
				{React.createElement(PrebuiltComponentMap[componentType].fc, {
					setUpdatingData,
					filterSearchTerm,
				})}
			</div>
		</DashboardInnerCard>
	)
}
