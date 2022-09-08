import BarChartV2 from '@components/BarChartV2/BarCharV2'
import Button from '@components/Button/Button/Button'
import CategoricalBarChart from '@components/CategoricalBarChart/CategoricalBarChar'
import { StandardDropdown } from '@components/Dropdown/StandardDropdown/StandardDropdown'
import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import LineChart, { Reference } from '@components/LineChart/LineChart'
import { LoadingBar } from '@components/Loading/Loading'
import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
import { Skeleton } from '@components/Skeleton/Skeleton'
import {
	useGetMetricMonitorsQuery,
	useGetMetricsHistogramLazyQuery,
	useGetMetricsTimelineLazyQuery,
} from '@graph/hooks'
import {
	DashboardChartType,
	DashboardMetricConfig,
	Maybe,
	MetricAggregator,
} from '@graph/schemas'
import useDataTimeRange from '@hooks/useDataTimeRange'
import SvgAnnouncementIcon from '@icons/AnnouncementIcon'
import SvgDragIcon from '@icons/DragIcon'
import EditIcon from '@icons/EditIcon'
import SvgPlusIcon from '@icons/PlusIcon'
import {
	EditMetricModal,
	UpdateMetricFn,
} from '@pages/Dashboards/components/EditMetricModal/EditMetricModal'
import EmptyCardPlaceholder from '@pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder'
import { WEB_VITALS_CONFIGURATION } from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils'
import { useParams } from '@util/react-router/useParams'
import classNames from 'classnames'
import _ from 'lodash'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'

import styles from './DashboardCard.module.scss'
import DashboardInnerCard from './DashboardInnerCard/DashboardInnerCard'

export const UNIT_OPTIONS = [
	{ label: 'Milliseconds', value: 'ms' },
	{ label: 'Seconds', value: 's' },
	{ label: 'No Units', value: '' },
]

const LINE_COLORS = {
	[MetricAggregator.Max]: 'var(--color-red-500)',
	[MetricAggregator.P99]: 'var(--color-red-400)',
	[MetricAggregator.P95]: 'var(--color-orange-500)',
	[MetricAggregator.P90]: 'var(--color-orange-400)',
	[MetricAggregator.P75]: 'var(--color-green-600)',
	[MetricAggregator.P50]: 'var(--color-blue-400)',
	[MetricAggregator.Avg]: 'var(--color-gray-400)',
	[MetricAggregator.Count]: 'var(--color-green-500)',
}

export type DeleteMetricFn = (idx: number) => void

interface Props {
	metricIdx: number
	metricConfig: DashboardMetricConfig
	updateMetric: UpdateMetricFn
	deleteMetric: DeleteMetricFn
}

const DashboardCard = ({
	metricIdx,
	metricConfig,
	updateMetric,
	deleteMetric,
}: Props) => {
	const [showEditModal, setShowEditModal] = useState<boolean>(false)
	const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
	const [updatingData, setUpdatingData] = useState<boolean>(true)
	const { project_id } = useParams<{ project_id: string }>()
	const { data: metricMonitors, loading: metricMonitorsLoading } =
		useGetMetricMonitorsQuery({
			variables: {
				project_id,
				metric_name: metricConfig.name,
			},
		})

	const history = useHistory()

	return (
		<>
			<DashboardInnerCard
				interactable
				className={styles.card}
				title={
					<div className={styles.cardHeader}>
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
							<div className={styles.chartButtons}>
								<div
									style={{
										marginRight: 'var(--size-xSmall)',
									}}
								>
									{metricConfig.name.length ? (
										metricMonitorsLoading ? (
											<Skeleton width={111} />
										) : (
											<StandardDropdown
												display={
													<div>
														<SvgAnnouncementIcon
															style={{
																marginBottom:
																	-3,
																marginRight:
																	'var(--size-xSmall)',
															}}
														/>
														{
															metricMonitors
																?.metric_monitors
																.length
														}
														{metricMonitors
															?.metric_monitors
															.length === 1
															? ' Monitor'
															: ' Monitors'}
													</div>
												}
												renderOption={(o) =>
													o.label ===
													'Create New Alert' ? (
														<>
															<div
																className={
																	styles.createNewAlertRow
																}
															>
																<SvgPlusIcon
																	style={{
																		marginRight:
																			'var(--size-xSmall)',
																		marginBottom: 2,
																	}}
																/>
																Create New Alert
															</div>
														</>
													) : undefined
												}
												data={[
													...(
														metricMonitors?.metric_monitors ||
														[]
													).map((mm) => ({
														label: mm?.name || '',
														value: mm?.id || '',
													})),
													{
														label: 'Create New Alert',
														value: -1,
													},
												]}
												onSelect={(mmId) => {
													if (mmId === -1) {
														history.push(
															`/${project_id}/alerts/new/monitor?type=${metricConfig.name}`,
														)
													} else {
														history.push(
															`/${project_id}/alerts/monitor/${mmId}`,
														)
													}
												}}
												className={styles.monitorItem}
												labelClassName={
													styles.monitorName
												}
											/>
										)
									) : (
										<div style={{ width: 161 }}></div>
									)}
								</div>
								<Button
									icon={
										<EditIcon
											style={{
												marginRight:
													'var(--size-xSmall)',
											}}
										/>
									}
									style={{
										marginRight: 'var(--size-xSmall)',
									}}
									trackingId={'DashboardCardEditMetric'}
									onClick={() => {
										setShowEditModal(true)
									}}
								>
									Edit
								</Button>
								<div
									className={styles.draggable}
									data-drag-handle=""
								>
									<SvgDragIcon />
								</div>
							</div>
						</div>
						<DeleteMetricModal
							name={metricConfig.name}
							showDeleteModal={showDeleteModal}
							onDelete={() => {
								setShowDeleteModal(false)
								setShowEditModal(false)
								deleteMetric(metricIdx)
							}}
							onCancel={() => {
								setShowDeleteModal(false)
							}}
						/>
						{updatingData && (
							<LoadingBar height={2} width={'100%'} />
						)}
					</div>
				}
			>
				<div className={styles.chartWrapper}>
					<ChartContainer
						metricIdx={metricIdx}
						metricConfig={metricConfig}
						chartType={metricConfig.chart_type}
						aggregator={metricConfig.aggregator}
						maxGoodValue={metricConfig.max_good_value}
						maxNeedsImprovementValue={
							metricConfig.max_needs_improvement_value
						}
						poorValue={metricConfig.poor_value}
						updateMetric={updateMetric}
						showEditModal={showEditModal}
						setShowEditModal={setShowEditModal}
						setShowDeleteModal={setShowDeleteModal}
						setUpdatingData={setUpdatingData}
					/>
				</div>
			</DashboardInnerCard>
		</>
	)
}

export const DeleteMetricModal = ({
	name,
	showDeleteModal,
	onDelete,
	onCancel,
}: {
	name: string
	showDeleteModal: boolean
	onDelete: () => void
	onCancel: () => void
}) => {
	return (
		<Modal
			visible={showDeleteModal}
			onCancel={onCancel}
			title={`Delete '${name}' Metric View?`}
			width={600}
		>
			<ModalBody>
				<p className={styles.description}>
					Are you sure you want to delete this metric?
				</p>
				<div className={styles.actionsContainer}>
					<Button
						trackingId="ConfirmDeleteDashboardMetricCancel"
						onClick={onCancel}
						type="default"
						className={styles.button}
					>
						Don't Delete View
					</Button>
					<Button
						trackingId="ConfirmDeleteDashboardMetric"
						danger
						type="primary"
						className={styles.button}
						onClick={onDelete}
					>
						Delete Metric View
					</Button>
				</div>
			</ModalBody>
		</Modal>
	)
}

const ChartContainer = React.memo(
	({
		metricIdx,
		metricConfig,
		chartType,
		aggregator,
		maxGoodValue,
		maxNeedsImprovementValue,
		poorValue,
		showEditModal,
		setMaxGoodValue,
		setMaxNeedsImprovementValue,
		setPoorValue,
		updateMetric,
		setShowEditModal,
		setShowDeleteModal,
		setUpdatingData,
	}: {
		metricIdx: number
		metricConfig: DashboardMetricConfig
		chartType?: Maybe<DashboardChartType>
		aggregator?: Maybe<MetricAggregator>
		maxGoodValue?: Maybe<number>
		maxNeedsImprovementValue?: Maybe<number>
		poorValue?: Maybe<number>
		showEditModal: boolean
		setMaxGoodValue?: (v: number) => void
		setMaxNeedsImprovementValue?: (v: number) => void
		setPoorValue?: (v: number) => void
		updateMetric: UpdateMetricFn
		setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>
		setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>
		setUpdatingData: React.Dispatch<React.SetStateAction<boolean>>
	}) => {
		const NUM_BUCKETS = 60
		const TICK_EVERY_BUCKETS = 10
		const { project_id } = useParams<{ project_id: string }>()
		const [chartInitialLoading, setChartInitialLoading] = useState(true)
		const { timeRange, setTimeRange } = useDataTimeRange()
		const { lookback: lookbackMinutes } = timeRange
		const [referenceArea, setReferenceArea] = useState<{
			start: string
			end: string
		}>({ start: '', end: '' })
		const [timelineTicks, setTimelineTicks] = useState<{
			ticks: string[]
			format: string
		}>({ ticks: [], format: '' })
		const refetchInterval = useRef<number>()
		const resolutionMinutes = Math.ceil(lookbackMinutes / NUM_BUCKETS)
		const [
			loadTimeline,
			{
				loading: timelineLoading,
				refetch: refetchTimeline,
				data: timelineData,
			},
		] = useGetMetricsTimelineLazyQuery({
			variables: {
				project_id,
				metric_name: metricConfig.name,
				params: {
					aggregator: aggregator,
					date_range: _.pick(timeRange, 'start_date', 'end_date'),
					timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
					resolution_minutes: resolutionMinutes,
					units: metricConfig.units,
					filters: metricConfig.filters,
					groups: metricConfig.groups,
				},
			},
			fetchPolicy: 'cache-first',
			onCompleted: () => {
				setChartInitialLoading(false)
			},
			onError: console.error,
		})
		const [
			loadHistogram,
			{
				loading: histogramLoading,
				refetch: refetchHistogram,
				data: histogramData,
			},
		] = useGetMetricsHistogramLazyQuery({
			variables: {
				project_id,
				metric_name: metricConfig.name,
				params: {
					date_range: _.pick(timeRange, 'start_date', 'end_date'),
					buckets: NUM_BUCKETS,
					units: metricConfig.units,
					min_value: metricConfig.min_value,
					min_percentile: metricConfig.min_percentile,
					max_value: metricConfig.max_value,
					max_percentile: metricConfig.max_percentile,
					filters: metricConfig.filters,
				},
			},
			fetchPolicy: 'cache-first',
			onCompleted: () => {
				setChartInitialLoading(false)
			},
			onError: console.error,
		})

		useEffect(() => {
			if (chartType === DashboardChartType.Histogram) {
				if (refetchHistogram) {
					refetchHistogram()
				} else {
					loadHistogram()
				}
			} else if (
				chartType === DashboardChartType.Timeline ||
				chartType === DashboardChartType.TimelineBar
			) {
				if (refetchTimeline) {
					refetchTimeline()
				} else {
					loadTimeline()
				}
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [chartType, timeRange.start_date, timeRange.end_date])

		useEffect(() => {
			if (refetchInterval.current) {
				window.clearInterval(refetchInterval.current)
			}

			// Stop polling once a user selects a custom range.
			if (timeRange.absolute) {
				return
			}

			const handler = () => {
				setTimeRange(
					moment().subtract(lookbackMinutes, 'minutes').format(),
					moment().format(),
				)
			}

			if (!refetchInterval.current) {
				handler()
			}

			refetchInterval.current = window.setInterval(handler, 60000)

			// Refs could be cleaned up before the cleanup method is invoked.
			// Hook warnings said to assign to a var to ensure it's available.
			const interval = refetchInterval.current
			return () => window.clearInterval(interval)

			// Only invoke on initialization and custom date range selection.
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [timeRange.absolute, lookbackMinutes])

		useEffect(() => {
			setUpdatingData(timelineLoading || histogramLoading)
		}, [setUpdatingData, timelineLoading, histogramLoading])

		useEffect(() => {
			// build out the ticks array based on data and lookbackMinutes
			const tickFormat = lookbackMinutes > 24 * 60 ? 'D MMM' : 'HH:mm'
			const ticks: string[] = []
			const seenDays: Set<string> = new Set<string>()
			let lastDate: moment.Moment | undefined = undefined
			for (const d of timelineData?.metrics_timeline || []) {
				const pointDate = d?.date
				if (pointDate) {
					const newDate = moment(pointDate)
					if (
						lastDate &&
						newDate.diff(lastDate, 'minutes') <
							(lookbackMinutes / NUM_BUCKETS) * TICK_EVERY_BUCKETS
					) {
						continue
					}
					lastDate = moment(newDate)
					const formattedDate = newDate.format(tickFormat)
					if (!seenDays.has(formattedDate)) {
						ticks.push(pointDate)
						seenDays.add(formattedDate)
					}
				}
			}
			setTimelineTicks({ ticks, format: tickFormat })
			// Only invoke on new data.
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [timelineData?.metrics_timeline])

		let referenceLines: Reference[] = []
		if (WEB_VITALS_CONFIGURATION[metricConfig.name]) {
			referenceLines = [
				{
					label: 'Goal',
					value: maxGoodValue || 0,
					color: 'var(--color-green-300)',
					onDrag:
						setMaxGoodValue &&
						((y) => {
							setMaxGoodValue(y)
						}),
				},
				{
					label: 'Needs Improvement',
					value: maxNeedsImprovementValue || 0,
					color: 'var(--color-red-200)',
					onDrag:
						setMaxNeedsImprovementValue &&
						((y) => {
							setMaxNeedsImprovementValue(y)
						}),
				},
				{
					label: 'Poor',
					value: poorValue || 0,
					color: 'var(--color-red-400)',
					onDrag:
						setPoorValue &&
						((y) => {
							setPoorValue(y)
						}),
				},
			]
		}

		return (
			<div
				className={classNames({
					[styles.blurChart]:
						timelineLoading ||
						histogramLoading ||
						chartInitialLoading,
				})}
			>
				<EditMetricModal
					shown={showEditModal}
					onCancel={() => {
						setShowEditModal(false)
					}}
					onDelete={() => {
						setShowDeleteModal(true)
					}}
					metricConfig={metricConfig}
					metricIdx={metricIdx}
					updateMetric={updateMetric}
				/>
				{!chartInitialLoading &&
				!timelineData?.metrics_timeline.length &&
				!histogramData?.metrics_histogram?.buckets.length ? (
					<div className={styles.noDataContainer}>
						<EmptyCardPlaceholder
							message={`Doesn't look like we've gotten any ${metricConfig.name} data from your app yet. This is normal! You should start seeing data here soon after integrating.`}
						/>
					</div>
				) : chartType === DashboardChartType.Histogram ? (
					<BarChartV2
						height={275}
						data={histogramData?.metrics_histogram?.buckets || []}
						referenceLines={referenceLines}
						barColorMapping={{
							count: 'var(--color-purple-500)',
						}}
						xAxisDataKeyName="range_end"
						xAxisLabel={metricConfig.units || undefined}
						xAxisTickFormatter={(value: number) =>
							value < 1 ? value.toFixed(2) : value.toFixed(0)
						}
						xAxisUnits={metricConfig.units || undefined}
						yAxisLabel={'occurrences'}
						yAxisKeys={['count']}
					/>
				) : chartType === DashboardChartType.Timeline ? (
					<LineChart
						height={275}
						syncId="dashboardChart"
						data={(timelineData?.metrics_timeline || []).map(
							(x) => ({
								date: x?.date,
								[x?.group ||
								x?.aggregator ||
								MetricAggregator.Avg]: x?.value,
							}),
						)}
						referenceLines={referenceLines}
						xAxisDataKeyName="date"
						xAxisTickFormatter={(tickItem) =>
							moment(tickItem).format(timelineTicks.format)
						}
						xAxisProps={{
							ticks: timelineTicks.ticks,
							tickCount: timelineTicks.ticks.length,
							domain: ['dataMin', 'dataMax'],
							scale: 'point',
							interval: 0, // show all ticks
						}}
						lineColorMapping={LINE_COLORS}
						yAxisLabel={metricConfig.units || ''}
						referenceAreaProps={{
							x1: referenceArea.start,
							x2: referenceArea.end,
						}}
						onMouseDown={(e?: any) => {
							e?.activeLabel &&
								setReferenceArea({
									start: e.activeLabel,
									end: referenceArea.end,
								})
						}}
						onMouseMove={(e?: any) => {
							e?.activeLabel &&
								referenceArea.start &&
								setReferenceArea({
									start: referenceArea.start,
									end: e.activeLabel,
								})
						}}
						onMouseUp={() => {
							if (Object.values(referenceArea).includes('')) {
								return
							}

							const { start, end } = referenceArea

							if (end > start) {
								setTimeRange(start, end, true)
							} else {
								setTimeRange(end, start, true)
							}

							setReferenceArea({ start: '', end: '' })
						}}
					/>
				) : chartType === DashboardChartType.TimelineBar ? (
					<CategoricalBarChart
						syncId="dashboardChart"
						height={275}
						stacked
						data={(timelineData?.metrics_timeline || []).map(
							(x) => ({
								date: x?.date,
								[x?.group ||
								x?.aggregator ||
								MetricAggregator.Avg]: x?.value,
							}),
						)}
						referenceLines={referenceLines}
						barColorMapping={LINE_COLORS}
						xAxisDataKeyName="date"
						xAxisTickFormatter={(tickItem) =>
							moment(tickItem).format(timelineTicks.format)
						}
						xAxisProps={{
							ticks: timelineTicks.ticks,
							tickCount: timelineTicks.ticks.length,
						}}
						yAxisLabel={metricConfig.units || ''}
					/>
				) : null}
			</div>
		)
	},
	(prevProps, nextProps) =>
		prevProps.showEditModal === nextProps.showEditModal &&
		prevProps.chartType === nextProps.chartType &&
		prevProps.aggregator === nextProps.aggregator &&
		prevProps.maxGoodValue === nextProps.maxGoodValue &&
		prevProps.maxNeedsImprovementValue ===
			nextProps.maxNeedsImprovementValue &&
		prevProps.poorValue === nextProps.poorValue &&
		prevProps.metricConfig.name === nextProps.metricConfig.name &&
		prevProps.metricConfig.chart_type ===
			nextProps.metricConfig.chart_type &&
		prevProps.metricConfig.units === nextProps.metricConfig.units &&
		prevProps.metricConfig.description ===
			nextProps.metricConfig.description &&
		prevProps.metricConfig.min_value === nextProps.metricConfig.min_value &&
		prevProps.metricConfig.min_percentile ===
			nextProps.metricConfig.min_percentile &&
		prevProps.metricConfig.max_value === nextProps.metricConfig.max_value &&
		prevProps.metricConfig.max_percentile ===
			nextProps.metricConfig.max_percentile &&
		_.isEqual(
			prevProps.metricConfig.filters,
			nextProps.metricConfig.filters,
		) &&
		_.isEqual(prevProps.metricConfig.groups, nextProps.metricConfig.groups),
)

export default DashboardCard
