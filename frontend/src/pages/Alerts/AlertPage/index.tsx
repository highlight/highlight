import {
	Box,
	DateRangePicker,
	DEFAULT_TIME_PRESETS,
	IconSolidBell,
	IconSolidCheveronRight,
	IconSolidPauseCircle,
	IconSolidPencil,
	IconSolidPlayCircle,
	presetStartDate,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { useNavigate } from 'react-router-dom'
import { useParams } from '@util/react-router/useParams'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'

import { Button } from '@components/Button'
import { toast } from '@/components/Toaster'
import {
	GetAlertDocument,
	useGetAlertQuery,
	useGetAlertingAlertStateChangesLazyQuery,
	useGetLastAlertStateChangesLazyQuery,
	useUpdateAlertDisabledMutation,
} from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'
import { useSearchTime } from '@/hooks/useSearchTime'
import { HeaderDivider } from '@/pages/Graphing/Dashboard'
import { GraphContextProvider } from '@/pages/Graphing/context/GraphContext'
import { useGraphData } from '@pages/Graphing/hooks/useGraphData'
import {
	Alert,
	AlertStateChange,
	ThresholdCondition,
	ThresholdType,
} from '@/graph/generated/schemas'

import { AlertGraph } from '../AlertGraph'
import { AlertHeader } from './AlertHeader'
import { AlertInfo } from './AlertInfo'
import { AlertTable } from './AlertTable'
import * as style from './styles.css'
import SearchPagination from '@/components/SearchPagination/SearchPagination'
import { NumberParam, useQueryParam, withDefault } from 'use-query-params'

const START_PAGE = 1
const PAGE_SIZE = 10
const PAGE_PARAM = withDefault(NumberParam, START_PAGE)

export const AlertPage: React.FC = () => {
	const { projectId } = useProjectId()
	const graphContext = useGraphData()
	const { alert_id } = useParams<{
		alert_id: string
	}>()
	const [page, setPage] = useQueryParam('page', PAGE_PARAM)
	const updatePage = (page: number) => {
		setPage(page, 'replaceIn')
	}

	const navigate = useNavigate()
	const [updateLoading, setUpdateLoading] = useState(false)

	const { startDate, endDate, selectedPreset, updateSearchTime } =
		useSearchTime({
			presets: DEFAULT_TIME_PRESETS,
			initialPreset: DEFAULT_TIME_PRESETS[2],
		})

	const { data, loading } = useGetAlertQuery({
		variables: {
			id: alert_id!,
		},
		skip: !alert_id,
	})

	const [
		getAlertingAlertStateChangesQuery,
		{
			error: alertingError,
			data: alertingData,
			loading: alertingLoading,
			refetch: alertingRefetch,
		},
	] = useGetAlertingAlertStateChangesLazyQuery()

	useEffect(() => {
		if (!alert_id) {
			return
		}

		getAlertingAlertStateChangesQuery({
			variables: {
				alert_id: alert_id!,
				start_date: startDate.toISOString(),
				end_date: endDate.toISOString(),
				page: page,
			},
		})
	}, [alert_id, startDate, endDate, page, getAlertingAlertStateChangesQuery])

	const [
		getLastAlertStateChangesQuery,
		{ data: currentStateData, loading: currentStateLoading },
	] = useGetLastAlertStateChangesLazyQuery()

	useEffect(() => {
		if (!alert_id) {
			return
		}

		getLastAlertStateChangesQuery({
			variables: {
				alert_id: alert_id!,
			},
		})
	}, [alert_id, getLastAlertStateChangesQuery])

	const [updateAlertDisabled] = useUpdateAlertDisabledMutation()

	const redirectToAlerts = () => {
		navigate(`/${projectId}/alerts`)
	}

	const redirectToEditAlert = () => {
		navigate(`/${projectId}/alerts/${alert_id}/edit`)
	}

	const handleToggleDisabled = async (disabled: boolean) => {
		if (!data?.alert) {
			return
		}

		setUpdateLoading(true)
		await updateAlertDisabled({
			refetchQueries: [
				{
					query: GetAlertDocument,
					variables: {
						id: alert_id!,
					},
				},
			],
			variables: {
				alert_id: alert_id!,
				project_id: projectId,
				disabled: disabled,
			},
		})

		toast.success(
			disabled
				? `Paused "${data?.alert.name}"`
				: `Enabled "${data?.alert.name}"`,
			{ duration: 5000 },
		)

		setUpdateLoading(false)
	}

	if (loading || !data?.alert) {
		return null
	}

	return (
		<GraphContextProvider value={graphContext}>
			<Helmet>
				<title>{data.alert.name}</title>
			</Helmet>
			<Box
				background="n2"
				padding="8"
				flex="stretch"
				justifyContent="stretch"
				display="flex"
				overflow="hidden"
			>
				<Box
					background="white"
					borderRadius="6"
					flexDirection="column"
					display="flex"
					flexGrow={1}
					border="dividerWeak"
					shadow="medium"
				>
					<Box
						width="full"
						cssClass={style.alertTopbar}
						borderBottom="dividerWeak"
						display="flex"
						justifyContent="space-between"
						alignItems="center"
						paddingLeft="12"
						paddingRight="8"
						py="6"
					>
						<Box
							alignItems="center"
							display="flex"
							gap="4"
							color="weak"
							flexWrap="nowrap"
						>
							<Tag
								shape="basic"
								kind="secondary"
								lines="1"
								iconLeft={<IconSolidBell />}
								onClick={redirectToAlerts}
							>
								Alerts
							</Tag>
							<IconSolidCheveronRight />
							<Text size="small" weight="medium" color="default">
								{data.alert.name}
							</Text>
						</Box>
						<Box display="flex" gap="4">
							<DateRangePicker
								emphasis="low"
								kind="secondary"
								selectedValue={{
									startDate,
									endDate,
									selectedPreset,
								}}
								onDatesChange={updateSearchTime}
								presets={DEFAULT_TIME_PRESETS}
								minDate={presetStartDate(
									DEFAULT_TIME_PRESETS[5],
								)}
							/>
							<HeaderDivider />
							<Button
								emphasis="medium"
								kind="secondary"
								iconLeft={
									data.alert.disabled ? (
										<IconSolidPlayCircle />
									) : (
										<IconSolidPauseCircle />
									)
								}
								onClick={() =>
									handleToggleDisabled(!data.alert.disabled)
								}
								trackingId="AlertDisableButton"
								disabled={updateLoading}
							>
								{data.alert.disabled
									? 'Enable alert'
									: 'Pause alert'}
							</Button>
							<Button
								emphasis="medium"
								kind="secondary"
								iconLeft={<IconSolidPencil />}
								onClick={redirectToEditAlert}
								trackingId="AlertConfigure"
							>
								Configure
							</Button>
						</Box>
					</Box>
					<Box
						display="flex"
						flexDirection="column"
						justifyContent="flex-start"
						gap="12"
						p="16"
						cssClass={style.alertContainer}
						overflowY="auto"
						hiddenScroll
					>
						<AlertHeader
							alertName={data.alert.name}
							productType={data.alert.product_type}
							disabled={data.alert.disabled}
						/>
						<AlertInfo
							alertStateChanges={
								currentStateData?.last_alert_state_changes as AlertStateChange[]
							}
							loading={currentStateLoading}
							totalAlerts={
								alertingData?.alerting_alert_state_changes
									.totalCount
							}
							totalAlertsLoading={alertingLoading}
						/>
						<Box height="full" width="full">
							<AlertGraph
								alertName={data.alert.name}
								query={data.alert.query ?? ''}
								productType={data.alert.product_type}
								functionColumn={
									data.alert.function_column ?? ''
								}
								functionType={data.alert.function_type}
								groupByKey={
									data.alert.group_by_key ?? undefined
								}
								startDate={startDate}
								endDate={endDate}
								selectedPreset={selectedPreset}
								updateSearchTime={updateSearchTime}
								thresholdWindow={
									data.alert.threshold_window ?? 0
								}
								thresholdValue={data.alert.threshold_value ?? 0}
								thresholdType={
									data.alert.threshold_type ??
									ThresholdType.Constant
								}
								thresholdCondition={
									data.alert.threshold_condition ??
									ThresholdCondition.Above
								}
							/>
						</Box>
						<Box height="full" width="full">
							<AlertTable
								alert={data.alert as Alert}
								loading={alertingLoading}
								error={alertingError}
								refetch={alertingRefetch}
								alertingStates={
									alertingData?.alerting_alert_state_changes
										.alertStateChanges as AlertStateChange[]
								}
							/>
							<SearchPagination
								page={page}
								setPage={updatePage}
								totalCount={
									alertingData?.alerting_alert_state_changes
										.totalCount ?? 0
								}
								pageSize={PAGE_SIZE}
								loading={alertingLoading}
							/>
						</Box>
					</Box>
				</Box>
			</Box>
		</GraphContextProvider>
	)
}
