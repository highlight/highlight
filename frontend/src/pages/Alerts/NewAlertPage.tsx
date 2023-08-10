import Card from '@components/Card/Card'
import {
	Box,
	Container,
	IconSolidCheveronRight,
	IconSolidSpeakerphone,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui'
import SvgMonitorIcon from '@icons/MonitorIcon'
import { AlertConfigurationCard } from '@pages/Alerts/AlertConfigurationCard/AlertConfigurationCard'
import {
	ALERT_CONFIGURATIONS,
	ALERT_NAMES,
	ALERT_TYPE,
} from '@pages/Alerts/Alerts'
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext'
import { getAlertTypeColor } from '@pages/Alerts/utils/AlertsUtils'
import { useParams } from '@util/react-router/useParams'
import { snakeCaseString } from '@util/string'
import { Helmet } from 'react-helmet'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import layoutStyles from '../../components/layout/LeadAlignLayout.module.css'
import styles from './NewAlertPage.module.css'

const NewAlertPage = () => {
	const { type, project_id } = useParams<{
		type?: ALERT_NAMES
		project_id: string
	}>()
	const { alertsPayload, slackUrl } = useAlertsContext()
	const location = useLocation()
	const navigate = useNavigate()

	const url = location.pathname
	// Redirect the user if the alert type is not valid.
	if (
		type &&
		!Object.values(ALERT_NAMES)
			.map((alert) => snakeCaseString(alert.toString()))
			.includes(type)
	) {
		navigate(`/${project_id}/alerts/new`, { replace: true })
		return null
	}

	return (
		<Box width="full" background="raised" p="8">
			<Helmet>
				<title>Create New Alert</title>
			</Helmet>
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
				<Container display="flex" flexDirection="column" gap="24">
					<Box style={{ maxWidth: 860 }} my="40" mx="auto">
						<Stack gap="24">
							<Box
								display="flex"
								alignItems="center"
								gap="4"
								color="weak"
							>
								<Tag
									kind="secondary"
									size="medium"
									shape="basic"
									emphasis="high"
									iconLeft={<IconSolidSpeakerphone />}
									onClick={() => {
										navigate(`/${project_id}/alerts`)
									}}
								>
									Alerts
								</Tag>
								<IconSolidCheveronRight />
								<Text
									color="moderate"
									size="small"
									weight="medium"
									userSelect="none"
								>
									{type ? 'Session alert' : 'New alert'}
								</Text>
							</Box>
							{!type ? (
								<>
									<p className={layoutStyles.subTitle}>
										👋 Let's create an alert! Alerts are a
										way to keep your team in the loop as to
										what is happening on your app.
									</p>
									<div className={styles.cardGrid}>
										{Object.keys(ALERT_CONFIGURATIONS).map(
											(_key) => {
												const key =
													_key as keyof typeof ALERT_CONFIGURATIONS
												const configuration =
													ALERT_CONFIGURATIONS[key]
												const alertColor =
													getAlertTypeColor(
														configuration.name,
													)

												if (
													configuration.name ===
													'Metric Monitor'
												) {
													return null
												}

												return (
													<Link
														className={
															styles.cardContent
														}
														key={key}
														state={{
															errorName: `${configuration.name} Alert`,
														}}
														to={`${url}/${snakeCaseString(
															configuration.name,
														)}`}
													>
														<Card
															interactable
															className={
																styles.cardContainer
															}
														>
															<h2
																id={
																	styles.title
																}
															>
																<span
																	className={
																		styles.icon
																	}
																	style={{
																		backgroundColor:
																			alertColor,
																	}}
																>
																	{
																		ALERT_CONFIGURATIONS[
																			key
																		].icon
																	}
																</span>
																{
																	ALERT_CONFIGURATIONS[
																		key
																	].name
																}
															</h2>
															<p
																className={
																	styles.description
																}
															>
																{
																	ALERT_CONFIGURATIONS[
																		key
																	]
																		.description
																}
															</p>
														</Card>
													</Link>
												)
											},
										)}
										<Link
											className={styles.cardContent}
											to={`${url}/monitor`}
											state={{
												errorName: `New Monitor`,
											}}
										>
											<Card
												interactable
												className={styles.cardContainer}
											>
												<h2 id={styles.title}>
													<span
														className={styles.icon}
														style={{
															backgroundColor:
																'var(--color-orange-500)',
														}}
													>
														<SvgMonitorIcon />
													</span>
													Metric Monitor
												</h2>
												<p
													className={
														styles.description
													}
												>
													Get alerted when a metric
													value is larger than a
													threshold.
												</p>
											</Card>
										</Link>
									</div>
								</>
							) : (
								<AlertConfigurationCard
									alert={{
										...getNewAlert(type)?.alert,
									}}
									slackUrl={slackUrl}
									isSlackIntegrated={
										alertsPayload?.is_integrated_with_slack ||
										false
									}
									isDiscordIntegrated={
										alertsPayload?.is_integrated_with_discord ||
										false
									}
									emailSuggestions={(
										alertsPayload?.admins || []
									).map((wa) => wa.admin!.email)}
									channelSuggestions={
										alertsPayload?.slack_channel_suggestion ||
										[]
									}
									discordChannelSuggestions={
										alertsPayload?.discord_channel_suggestions ||
										[]
									}
									environmentOptions={
										alertsPayload?.environment_suggestion ||
										[]
									}
									// @ts-expect-error
									configuration={
										getNewAlert(type)?.configuration
									}
									isCreatingNewAlert
								/>
							)}
						</Stack>
					</Box>
				</Container>
			</Box>
		</Box>
	)
}

export default NewAlertPage

const getNewAlert = (type: ALERT_NAMES) => {
	switch (type) {
		case snakeCaseString(ALERT_NAMES.ERROR_ALERT):
			return {
				alert: {
					Name: ALERT_NAMES.ERROR_ALERT,
					ExcludedEnvironments: [],
					CountThreshold: 1,
					Type: ALERT_TYPE.Error,
					ThresholdWindow: 30,
				},
				configuration: ALERT_CONFIGURATIONS['ERROR_ALERT'],
			} as const
		case snakeCaseString(ALERT_NAMES.TRACK_PROPERTIES_ALERT):
			return {
				alert: {
					Name: ALERT_NAMES.TRACK_PROPERTIES_ALERT,
					ExcludedEnvironments: [],
					CountThreshold: 1,
					Type: ALERT_TYPE.TrackProperties,
				},
				configuration: ALERT_CONFIGURATIONS['TRACK_PROPERTIES_ALERT'],
			} as const
		case snakeCaseString(ALERT_NAMES.NEW_SESSION_ALERT):
			return {
				alert: {
					Name: ALERT_NAMES.NEW_SESSION_ALERT,
					ExcludedEnvironments: [],
					CountThreshold: 1,
					ThresholdWindow: 30,
					Type: ALERT_TYPE.NewSession,
				},
				configuration: ALERT_CONFIGURATIONS['NEW_SESSION_ALERT'],
			} as const
		case snakeCaseString(ALERT_NAMES.NEW_USER_ALERT):
			return {
				alert: {
					Name: ALERT_NAMES.NEW_USER_ALERT,
					ExcludedEnvironments: [],
					CountThreshold: 1,
					ThresholdWindow: 30,
					Type: ALERT_TYPE.FirstTimeUser,
				},
				configuration: ALERT_CONFIGURATIONS['NEW_USER_ALERT'],
			} as const
		case snakeCaseString(ALERT_NAMES.USER_PROPERTIES_ALERT):
			return {
				alert: {
					Name: ALERT_NAMES.USER_PROPERTIES_ALERT,
					ExcludedEnvironments: [],
					CountThreshold: 1,
					ThresholdWindow: 30,
					Type: ALERT_TYPE.UserProperties,
					UserProperties: [],
				},
				configuration: ALERT_CONFIGURATIONS['USER_PROPERTIES_ALERT'],
			} as const
		case snakeCaseString(ALERT_NAMES.RAGE_CLICK_ALERT):
			return {
				alert: {
					Name: ALERT_NAMES.RAGE_CLICK_ALERT,
					ExcludedEnvironments: [],
					CountThreshold: 1,
					Type: ALERT_TYPE.RageClick,
					ThresholdWindow: 30,
				},
				configuration: ALERT_CONFIGURATIONS['RAGE_CLICK_ALERT'],
			} as const
	}
}
