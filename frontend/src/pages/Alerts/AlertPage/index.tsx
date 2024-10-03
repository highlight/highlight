import {
	Box,
	DateRangePicker,
	DEFAULT_TIME_PRESETS,
	IconSolidBell,
	IconSolidCheveronRight,
	presetStartDate,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { useNavigate } from 'react-router-dom'
import { useParams } from '@util/react-router/useParams'
import React, { useState } from 'react'
import { Helmet } from 'react-helmet'

import { Button } from '@components/Button'
import { toast } from '@/components/Toaster'
import { namedOperations } from '@/graph/generated/operations'
import {
	useGetAlertQuery,
	useUpdateAlertDisabledMutation,
} from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'
import { useSearchTime } from '@/hooks/useSearchTime'
import { HeaderDivider } from '@/pages/Graphing/Dashboard'

import { AlertGraph } from '../AlertGraph'
import * as style from './styles.css'
import { AlertHeader } from '@/pages/Alerts/AlertPage/AlertHeader'

export const AlertPage: React.FC = () => {
	const { projectId } = useProjectId()
	const { alert_id } = useParams<{
		alert_id: string
	}>()
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
			refetchQueries: [namedOperations.Query.GetAlert],
			variables: {
				alert_id: alert_id!,
				project_id: projectId,
				disabled: disabled,
			},
		})

		toast.success(
			disabled
				? `Paused "${data?.alert.name}"`
				: `Activated "${data?.alert.name}"`,
			{ duration: 5000 },
		)

		setUpdateLoading(false)
	}

	if (loading || !data?.alert) {
		return null
	}

	return (
		<>
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
								emphasis="low"
								kind="secondary"
								onClick={() =>
									handleToggleDisabled(!data.alert.disabled)
								}
								trackingId="AlertDisableButton"
								disabled={updateLoading}
							>
								{data.alert.disabled
									? 'Activate alert'
									: 'Pause alert'}
							</Button>
							<Button
								emphasis="low"
								kind="secondary"
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
					>
						<AlertHeader
							alertName={data.alert.name}
							productType={data.alert.product_type}
							disabled={data.alert.disabled}
						/>
						{/* TODO(spenny): add alert info */}
						<AlertGraph
							alertName={data.alert.name}
							query={data.alert.query ?? ''}
							productType={data.alert.product_type}
							functionColumn={data.alert.function_column ?? ''}
							functionType={data.alert.function_type}
							groupByKey={data.alert.group_by_key ?? undefined}
							startDate={startDate}
							endDate={endDate}
							selectedPreset={selectedPreset}
							updateSearchTime={updateSearchTime}
							// TODO(spenny): should be optional to support anomoly alerts
							thresholdWindow={data.alert.threshold_window ?? 0}
							thresholdValue={data.alert.threshold_value ?? 0}
							belowThreshold={data.alert.below_threshold ?? false}
						/>
						{/* TODO(spenny): add alert states */}
					</Box>
				</Box>
			</Box>
		</>
	)
}
