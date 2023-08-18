import BarChart from '@components/BarChart/BarChart'
import Card from '@components/Card/Card'
import LoadingBox from '@components/LoadingBox'
import { SearchEmptyState } from '@components/SearchEmptyState/SearchEmptyState'
import Table from '@components/Table/Table'
import Tag from '@components/Tag/Tag'
import { GetAlertsPagePayloadQuery } from '@graph/operations'
import {
	Box,
	Container,
	Heading,
	IconSolidLogs,
	IconSolidPlus,
	Stack,
	Text,
} from '@highlight-run/ui'
import SvgBugIcon from '@icons/BugIcon'
import SvgChevronRightIcon from '@icons/ChevronRightIcon'
import SvgCursorClickIcon from '@icons/CursorClickIcon'
import SvgFaceIdIcon from '@icons/FaceIdIcon'
import SvgMonitorIcon from '@icons/MonitorIcon'
import SvgSparkles2Icon from '@icons/Sparkles2Icon'
import SvgTargetIcon from '@icons/TargetIcon'
import SvgUserPlusIcon from '@icons/UserPlusIcon'
import { AlertEnableSwitch } from '@pages/Alerts/AlertEnableSwitch/AlertEnableSwitch'
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext'
import AlertLastEditedBy from '@pages/Alerts/components/AlertLastEditedBy/AlertLastEditedBy'
import { getAlertTypeColor } from '@pages/Alerts/utils/AlertsUtils'
import { useParams } from '@util/react-router/useParams'
import { compact } from 'lodash'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

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

const TABLE_COLUMNS = [
	{
		title: 'Name',
		dataIndex: 'Name',
		key: 'Name',
		render: (name: string, record: any) => {
			return (
				<div className={styles.nameCell}>
					<div className={styles.primary}>{name}</div>
					<div>
						<AlertLastEditedBy
							adminId={
								record.LastAdminToEditID ||
								record.last_admin_to_edit_id
							}
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
		title: 'Type',
		dataIndex: 'type',
		key: 'type',
		width: 160,
		render: (type: string, record: any) => {
			return (
				<span className={styles.cellWithTooltip}>
					<Tag
						backgroundColor={getAlertTypeColor(type)}
						color="var(--color-white)"
						infoTooltipText={record.configuration.description}
					>
						{type}
					</Tag>
				</span>
			)
		},
	},
	{
		title: 'Frequency',
		dataIndex: 'frequency',
		key: 'frequency',
		render: (frequency: any, record: any) => {
			const hasData = record?.DailyFrequency?.some(
				(value: number) => value !== 0,
			)

			return (
				<div className={styles.chart}>
					<div className={styles.innerChart}>
						{hasData ? (
							<BarChart
								maxValue={frequency}
								height={30}
								data={record.DailyFrequency}
							/>
						) : (
							<p className={styles.frequencyGraphEmptyMessage}>
								No Recent Alerts
							</p>
						)}
					</div>
				</div>
			)
		},
	},
	{
		title: 'Enable Switch',
		dataIndex: 'enabled',
		key: 'enabled',
		width: 160,
		render: (_: string, record: any) => (
			<AlertEnableSwitch record={record} />
		),
	},
	{
		title: 'Configure',
		dataIndex: 'configure',
		key: 'configure',
		render: (_: any, record: any) => (
			<Link
				to={
					record.type === ALERT_NAMES['METRIC_MONITOR']
						? `monitor/${record.id}`
						: record.type === ALERT_NAMES['LOG_ALERT']
						? `logs/${record.id}`
						: `${record.id}`
				}
				className={styles.configureButton}
				onClick={(e) => {
					e.stopPropagation()
				}}
			>
				Configure <SvgChevronRightIcon />
			</Link>
		),
	},
]

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

function AlertsPageLoaded({
	alertsPayload,
}: {
	alertsPayload: GetAlertsPagePayloadQuery | undefined
}) {
	const { project_id } = useParams<{ project_id: string }>()
	const navigate = useNavigate()

	const maxNum = (() => {
		const values = [
			alertsPayload?.error_alerts,
			alertsPayload?.new_user_alerts,
			alertsPayload?.track_properties_alerts,
			alertsPayload?.user_properties_alerts,
			alertsPayload?.new_session_alerts,
			alertsPayload?.rage_click_alerts,
			alertsPayload?.log_alerts,
		].flatMap((alerts) => alerts?.flatMap((alert) => alert?.DailyFrequency))

		return Math.max(...compact(values), 5)
	})()

	const alertsAsTableRows = [
		...(alertsPayload?.error_alerts || [])
			.map((alert) => ({
				...alert,
				configuration: ALERT_CONFIGURATIONS['ERROR_ALERT'],
				type: ALERT_CONFIGURATIONS['ERROR_ALERT'].name,
				Name: alert?.Name || ALERT_CONFIGURATIONS['ERROR_ALERT'].name,
				key: alert?.id,
				frequency: maxNum,
				allAdmins: alertsPayload?.admins || [],
			}))
			.sort((a, b) => a.Name.localeCompare(b.Name)),
		...(alertsPayload?.new_user_alerts || [])
			.map((alert) => ({
				...alert,
				configuration: ALERT_CONFIGURATIONS['NEW_USER_ALERT'],
				type: ALERT_CONFIGURATIONS['NEW_USER_ALERT'].name,
				Name:
					alert?.Name || ALERT_CONFIGURATIONS['NEW_USER_ALERT'].name,
				key: alert?.id,
				frequency: maxNum,
				allAdmins: alertsPayload?.admins || [],
			}))
			.sort((a, b) => a.Name.localeCompare(b.Name)),
		...(alertsPayload?.track_properties_alerts || [])
			.map((alert) => ({
				...alert,
				configuration: ALERT_CONFIGURATIONS['TRACK_PROPERTIES_ALERT'],
				type: ALERT_CONFIGURATIONS['TRACK_PROPERTIES_ALERT'].name,
				Name:
					alert?.Name ||
					ALERT_CONFIGURATIONS['TRACK_PROPERTIES_ALERT'].name,
				key: alert?.id,
				frequency: maxNum,
				allAdmins: alertsPayload?.admins || [],
			}))
			.sort((a, b) => a.Name.localeCompare(b.Name)),
		...(alertsPayload?.user_properties_alerts || [])
			.map((alert) => ({
				...alert,
				configuration: ALERT_CONFIGURATIONS['USER_PROPERTIES_ALERT'],
				type: ALERT_CONFIGURATIONS['USER_PROPERTIES_ALERT'].name,
				Name:
					alert?.Name ||
					ALERT_CONFIGURATIONS['USER_PROPERTIES_ALERT'].name,
				key: alert?.id,
				frequency: maxNum,
				allAdmins: alertsPayload?.admins || [],
			}))
			.sort((a, b) => a.Name.localeCompare(b.Name)),
		...(alertsPayload?.new_session_alerts || [])
			.map((alert) => ({
				...alert,
				configuration: ALERT_CONFIGURATIONS['NEW_SESSION_ALERT'],
				type: ALERT_CONFIGURATIONS['NEW_SESSION_ALERT'].name,
				Name:
					alert?.Name ||
					ALERT_CONFIGURATIONS['NEW_SESSION_ALERT'].name,
				key: alert?.id,
				frequency: maxNum,
				allAdmins: alertsPayload?.admins || [],
			}))
			.sort((a, b) => a.Name.localeCompare(b.Name)),
		...(alertsPayload?.rage_click_alerts || [])
			.map((alert) => ({
				...alert,
				configuration: ALERT_CONFIGURATIONS['RAGE_CLICK_ALERT'],
				type: ALERT_CONFIGURATIONS['RAGE_CLICK_ALERT'].name,
				Name:
					alert?.Name ||
					ALERT_CONFIGURATIONS['RAGE_CLICK_ALERT'].name,
				key: alert?.id,
				frequency: maxNum,
				allAdmins: alertsPayload?.admins || [],
			}))
			.sort((a, b) => a.Name.localeCompare(b.Name)),
		...(alertsPayload?.metric_monitors || [])
			.map((metricMonitor) => ({
				...metricMonitor,
				configuration: ALERT_CONFIGURATIONS['METRIC_MONITOR'],
				type: ALERT_CONFIGURATIONS['METRIC_MONITOR'].name,
				Name:
					metricMonitor?.name ||
					ALERT_CONFIGURATIONS['METRIC_MONITOR'].name,
				key: metricMonitor?.id,
				frequency: maxNum,
				allAdmins: alertsPayload?.admins || [],
			}))
			.sort((a, b) => a.Name.localeCompare(b.Name)),
		...(alertsPayload?.log_alerts || [])
			.map((logAlert) => ({
				...logAlert,
				configuration: ALERT_CONFIGURATIONS['LOG_ALERT'],
				type: ALERT_CONFIGURATIONS['LOG_ALERT'].name,
				Name: logAlert?.Name || ALERT_CONFIGURATIONS['LOG_ALERT'].name,
				key: logAlert?.id,
				frequency: maxNum,
				allAdmins: alertsPayload?.admins || [],
			}))
			.sort((a, b) => a.Name.localeCompare(b.Name)),
	]

	return (
		<Container display="flex" flexDirection="column" gap="24">
			<Box style={{ maxWidth: 860 }} my="40" mx="auto">
				<Stack gap="24">
					<Stack gap="16" direction="column">
						<Heading mt="16" level="h4">
							Alerts
						</Heading>
						<Text weight="medium" size="small" color="default">
							Manage all the alerts for your currently selected
							project.
						</Text>
					</Stack>
					<Stack gap="8">
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
								<Table
									columns={TABLE_COLUMNS}
									dataSource={alertsAsTableRows}
									pagination={false}
									showHeader={false}
									rowHasPadding
									renderEmptyComponent={
										<SearchEmptyState
											className={styles.emptyContainer}
											item="alerts"
											customTitle={`Your project doesn't have any alerts yet 😔`}
											customDescription={
												<>
													<LinkButton
														iconLeft={
															<IconSolidPlus />
														}
														trackingId="NewAlert"
														to={`/${project_id}/alerts/new`}
													>
														Create new alert
													</LinkButton>
												</>
											}
										/>
									}
									onRow={(record) => ({
										onClick: () => {
											if (
												record.type ===
												ALERT_NAMES['METRIC_MONITOR']
											) {
												navigate(
													`/${project_id}/alerts/monitor/${record.id}`,
												)
											} else if (
												record.type ===
												ALERT_NAMES['LOG_ALERT']
											) {
												navigate(
													`/${project_id}/alerts/logs/${record.id}`,
												)
											} else {
												navigate(
													`/${project_id}/alerts/${record.id}`,
												)
											}
										},
									})}
								/>
							</Card>
						)}
					</Stack>
				</Stack>
			</Box>
		</Container>
	)
}
