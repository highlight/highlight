import Card from '@components/Card/Card'
import LoadingBox from '@components/LoadingBox'
import { SearchEmptyState } from '@components/SearchEmptyState/SearchEmptyState'
import { GetAlertsPagePayloadQuery } from '@graph/operations'
import {
	Box,
	Container,
	Heading,
	IconSolidCheveronRight,
	IconSolidInformationCircle,
	IconSolidLogs,
	IconSolidPlus,
	Stack,
	Tag,
	Text,
	Tooltip,
} from '@highlight-run/ui'
import SvgBugIcon from '@icons/BugIcon'
import SvgCursorClickIcon from '@icons/CursorClickIcon'
import SvgFaceIdIcon from '@icons/FaceIdIcon'
import SvgMonitorIcon from '@icons/MonitorIcon'
import SvgSparkles2Icon from '@icons/Sparkles2Icon'
import SvgTargetIcon from '@icons/TargetIcon'
import SvgUserPlusIcon from '@icons/UserPlusIcon'
import { AlertEnableSwitch } from '@pages/Alerts/AlertEnableSwitch/AlertEnableSwitch'
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { LinkButton } from '@/components/LinkButton'

import styles from './Alerts.module.css'

// TODO(et) - replace these with the graphql generated SessionAlertType
export enum ALERT_TYPE {
	Error,
	FirstTimeUser,
	UserProperties,
	TrackProperties,
	NewSession,
	RageClick,
	MetricMonitor,
	Logs,
}

export enum ALERT_NAMES {
	ERROR_ALERT = 'Errors',
	NEW_USER_ALERT = 'New Users',
	USER_PROPERTIES_ALERT = 'User Properties',
	TRACK_PROPERTIES_ALERT = 'Track Events',
	NEW_SESSION_ALERT = 'New Sessions',
	RAGE_CLICK_ALERT = 'Rage Clicks',
	METRIC_MONITOR = 'Metric Monitor',
	LOG_ALERT = 'Logs',
}

interface AlertConfiguration {
	name: string
	canControlThreshold: boolean
	type: ALERT_TYPE
	description: string | React.ReactNode
	icon: React.ReactNode
	supportsExcludeRules: boolean
}

export const ALERT_CONFIGURATIONS: { [key: string]: AlertConfiguration } = {
	ERROR_ALERT: {
		name: ALERT_NAMES['ERROR_ALERT'],
		canControlThreshold: true,
		type: ALERT_TYPE.Error,
		description: 'Get alerted when an error is thrown in your app.',
		icon: <SvgBugIcon />,
		supportsExcludeRules: false,
	},
	RAGE_CLICK_ALERT: {
		name: ALERT_NAMES['RAGE_CLICK_ALERT'],
		canControlThreshold: true,
		type: ALERT_TYPE.RageClick,
		description: (
			<>
				{'Get alerted whenever a user'}{' '}
				{/* eslint-disable-next-line react/jsx-no-target-blank */}
				<a
					href="https://docs.highlight.run/rage-clicks"
					target="_blank"
				>
					rage clicks.
				</a>
			</>
		),
		icon: <SvgCursorClickIcon />,
		supportsExcludeRules: false,
	},
	NEW_USER_ALERT: {
		name: ALERT_NAMES['NEW_USER_ALERT'],
		canControlThreshold: false,
		type: ALERT_TYPE.FirstTimeUser,
		description:
			'Get alerted when a new user uses your app for the first time.',
		icon: <SvgUserPlusIcon />,
		supportsExcludeRules: false,
	},
	USER_PROPERTIES_ALERT: {
		name: ALERT_NAMES['USER_PROPERTIES_ALERT'],
		canControlThreshold: false,
		type: ALERT_TYPE.UserProperties,
		description:
			'Get alerted when users you want to track record a session.',
		icon: <SvgFaceIdIcon />,
		supportsExcludeRules: false,
	},
	TRACK_PROPERTIES_ALERT: {
		name: ALERT_NAMES['TRACK_PROPERTIES_ALERT'],
		canControlThreshold: false,
		type: ALERT_TYPE.TrackProperties,
		description: 'Get alerted when an action is done in your application.',
		icon: <SvgTargetIcon />,
		supportsExcludeRules: false,
	},
	NEW_SESSION_ALERT: {
		name: ALERT_NAMES['NEW_SESSION_ALERT'],
		canControlThreshold: false,
		type: ALERT_TYPE.NewSession,
		description: 'Get alerted every time a session is created.',
		icon: <SvgSparkles2Icon />,
		supportsExcludeRules: true,
	},
	METRIC_MONITOR: {
		name: ALERT_NAMES['METRIC_MONITOR'],
		canControlThreshold: false,
		type: ALERT_TYPE.MetricMonitor,
		description: 'Get alerted when a metric value exceeds a value.',
		icon: <SvgMonitorIcon />,
		supportsExcludeRules: true,
	},
	LOG_ALERT: {
		name: ALERT_NAMES['LOG_ALERT'],
		canControlThreshold: true,
		type: ALERT_TYPE.Logs,
		description: 'Get alerted when queried logs exceed a threshold.',
		icon: <IconSolidLogs />,
		supportsExcludeRules: true,
	},
} as const

export default function AlertsPage() {
	const { alertsPayload, loading } = useAlertsContext()

	return (
		<Box width="full" background="raised" p="8">
			<Box
				border="dividerWeak"
				borderRadius="6"
				width="full"
				shadow="medium"
				background="default"
				display="flex"
				flexDirection="column"
				height="full"
			>
				{loading && <LoadingBox />}
				{!loading && <AlertsPageLoaded alertsPayload={alertsPayload} />}
			</Box>
		</Box>
	)
}

function formatAlertDataForTable(alert: any, config: AlertConfiguration) {
	return {
		...alert,
		configuration: config,
		type: config.name,
		name: alert?.Name || config.name,
		key: alert?.id,
	}
}

function AlertsPageLoaded({
	alertsPayload,
}: {
	alertsPayload: GetAlertsPagePayloadQuery | undefined
}) {
	const { project_id } = useParams<{ project_id: string }>()
	const navigate = useNavigate()

	const alertsAsTableRows = [
		...(alertsPayload?.error_alerts || [])
			.map((alert) =>
				formatAlertDataForTable(
					alert,
					ALERT_CONFIGURATIONS['ERROR_ALERT'],
				),
			)
			.sort((a, b) => a.Name.localeCompare(b.Name)),
		...(alertsPayload?.new_user_alerts || [])
			.map((alert) =>
				formatAlertDataForTable(
					alert,
					ALERT_CONFIGURATIONS['NEW_USER_ALERT'],
				),
			)
			.sort((a, b) => a.Name.localeCompare(b.Name)),
		...(alertsPayload?.track_properties_alerts || [])
			.map((alert) =>
				formatAlertDataForTable(
					alert,
					ALERT_CONFIGURATIONS['TRACK_PROPERTIES_ALERT'],
				),
			)
			.sort((a, b) => a.Name.localeCompare(b.Name)),
		...(alertsPayload?.user_properties_alerts || [])
			.map((alert) =>
				formatAlertDataForTable(
					alert,
					ALERT_CONFIGURATIONS['USER_PROPERTIES_ALERT'],
				),
			)
			.sort((a, b) => a.Name.localeCompare(b.Name)),
		...(alertsPayload?.new_session_alerts || [])
			.map((alert) =>
				formatAlertDataForTable(
					alert,
					ALERT_CONFIGURATIONS['NEW_SESSION_ALERT'],
				),
			)
			.sort((a, b) => a.Name.localeCompare(b.Name)),
		...(alertsPayload?.rage_click_alerts || [])
			.map((alert) =>
				formatAlertDataForTable(
					alert,
					ALERT_CONFIGURATIONS['RAGE_CLICK_ALERT'],
				),
			)
			.sort((a, b) => a.Name.localeCompare(b.Name)),
		...(alertsPayload?.metric_monitors || [])
			.map((metricMonitor) =>
				formatAlertDataForTable(
					metricMonitor,
					ALERT_CONFIGURATIONS['METRIC_MONITOR'],
				),
			)
			.sort((a, b) => a.Name.localeCompare(b.Name)),
		...(alertsPayload?.log_alerts || [])
			.map((logAlert) =>
				formatAlertDataForTable(
					logAlert,
					ALERT_CONFIGURATIONS['LOG_ALERT'],
				),
			)
			.sort((a, b) => a.Name.localeCompare(b.Name)),
	]

	return (
		<Container display="flex" flexDirection="column" gap="24">
			<Box style={{ maxWidth: 560 }} my="40" mx="auto" width="full">
				<Stack gap="24" width="full">
					<Stack gap="16" direction="column" width="full">
						<Heading mt="16" level="h4">
							Alerts
						</Heading>
						<Text weight="medium" size="small" color="default">
							Manage all the alerts for your currently selected
							project.
						</Text>
					</Stack>
					<Stack gap="8" width="full">
						{alertsAsTableRows.length > 0 && (
							<Box
								display="flex"
								justifyContent="space-between"
								alignItems="center"
								width="full"
							>
								<Text weight="bold" size="small" color="strong">
									All alerts
								</Text>
								<LinkButton
									iconLeft={<IconSolidPlus />}
									trackingId="NewAlert"
									to={`/${project_id}/alerts/new`}
								>
									Create new alert
								</LinkButton>
							</Box>
						)}
						{alertsPayload && (
							<Card noPadding>
								{alertsAsTableRows.length > 0 ? (
									<>
										{alertsAsTableRows.map(
											(record, idx) => {
												return (
													<Stack
														key={idx}
														borderTop={`${
															idx != 0
																? 'dividerWeak'
																: 'none'
														}`}
														width="full"
														p="12"
														gap="8"
													>
														<Box
															display="flex"
															alignItems="center"
															gap="8"
														>
															<AlertEnableSwitch
																record={record}
															/>
															<Text
																weight="medium"
																size="small"
																color="strong"
															>
																{record.name}
															</Text>
														</Box>
														<Box
															display="flex"
															alignItems="center"
															gap="4"
														>
															<Tooltip
																trigger={
																	<Tag
																		kind="secondary"
																		size="medium"
																		shape="basic"
																		emphasis="high"
																		iconRight={
																			<IconSolidInformationCircle />
																		}
																	>
																		{
																			record.type
																		}
																	</Tag>
																}
															>
																{
																	record
																		.configuration
																		.description
																}
															</Tooltip>
															<Tag
																kind="secondary"
																size="medium"
																shape="basic"
																emphasis="low"
																iconRight={
																	<IconSolidCheveronRight />
																}
																onClick={() => {
																	if (
																		record.type ===
																		ALERT_NAMES[
																			'METRIC_MONITOR'
																		]
																	) {
																		navigate(
																			`/${project_id}/alerts/monitor/${record.id}`,
																		)
																	} else if (
																		record.type ===
																		ALERT_NAMES[
																			'LOG_ALERT'
																		]
																	) {
																		navigate(
																			`/${project_id}/alerts/logs/${record.id}`,
																		)
																	} else if (
																		record.type ===
																		ALERT_NAMES[
																			'ERROR_ALERT'
																		]
																	) {
																		navigate(
																			`/${project_id}/alerts/errors/${record.id}`,
																		)
																	} else {
																		navigate(
																			`/${project_id}/alerts/${record.id}`,
																		)
																	}
																}}
															>
																Configure
															</Tag>
														</Box>
													</Stack>
												)
											},
										)}
									</>
								) : (
									<SearchEmptyState
										className={styles.emptyContainer}
										item="alerts"
										customTitle={`Your project doesn't have any alerts yet 😔`}
										customDescription={
											<>
												<LinkButton
													iconLeft={<IconSolidPlus />}
													trackingId="NewAlert"
													to={`/${project_id}/alerts/new`}
												>
													Create new alert
												</LinkButton>
											</>
										}
									/>
								)}
							</Card>
						)}
					</Stack>
				</Stack>
			</Box>
		</Container>
	)
}
