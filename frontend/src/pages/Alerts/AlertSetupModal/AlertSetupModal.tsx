import Alert from '@components/Alert/Alert'
import Card from '@components/Card/Card'
import ConnectHighlightWithSlackButton from '@components/Header/components/ConnectHighlightWithSlackButton/ConnectHighlightWithSlackButton'
import Modal from '@components/Modal/Modal'
import Select from '@components/Select/Select'
import Steps from '@components/Steps/Steps'
import { useCreateDefaultAlertsMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import SvgCheck from '@icons/Check'
import SyncWithSlackButton from '@pages/Alerts/AlertConfigurationCard/SyncWithSlackButton'
import { ALERT_CONFIGURATIONS, ALERT_NAMES } from '@pages/Alerts/Alerts'
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext'
import { getAlertTypeColor } from '@pages/Alerts/utils/AlertsUtils'
import useLocalStorage from '@rehooks/local-storage'
import { useApplicationContext } from '@routers/OrgRouter/ApplicationContext'
import { Divider } from 'antd'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { useSessionStorage } from 'react-use'

import styles from './AlertSetupModal.module.scss'

const AlertSetupModal = () => {
	const [current, setCurrent] = React.useState(0)

	const { loading, alertsPayload, slackUrl } = useAlertsContext()
	const { currentProject } = useApplicationContext()

	useEffect(() => {
		if (current == 0 && alertsPayload?.is_integrated_with_slack === true) {
			setCurrent(current + 1)
		}
	}, [current, alertsPayload?.is_integrated_with_slack, setCurrent])

	const [selectedChannels, setSelectedChannels] = useSessionStorage<any[]>(
		`HighlightAlertSetupSelectedChannels-${currentProject?.id}`,
		[],
	)

	const [channels, setChannels] = useState<
		{
			value: string
			displayValue: string | React.ReactNode
			disabled?: boolean
			id: string
		}[]
	>([])

	useEffect(() => {
		if (!!alertsPayload?.slack_channel_suggestion) {
			setChannels(
				alertsPayload.slack_channel_suggestion
					.filter((predicate) => {
						return (
							predicate?.webhook_channel &&
							predicate.webhook_channel_id
						)
					})
					.map(({ webhook_channel, webhook_channel_id }: any) => ({
						displayValue: webhook_channel,
						value: webhook_channel_id,
						id: webhook_channel_id,
					})),
			)
		}
	}, [alertsPayload?.slack_channel_suggestion, setChannels])

	const onChannelsChange = (
		ch: {
			value: string
			displayValue: string | React.ReactNode
			disabled?: boolean
			id: string
		}[],
	) => {
		setSelectedChannels(ch)
	}

	const [searchQuery, setSearchQuery] = useState('')

	const [selectedAlerts, setSelectedAlerts] = useState<string[]>([])

	const [createDefaultAlerts, {}] = useCreateDefaultAlertsMutation({
		variables: {
			project_id: '',
			alert_types: [],
			slack_channels: [],
			emails: [],
		},
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})

	const [shouldCloseSetupPersisted, setShouldCloseSetupPersisted] =
		useLocalStorage<boolean>(
			`shouldCloseAlertSetupPersisted-${currentProject?.id}`,
			false,
		)

	useEffect(() => {
		if (
			!loading &&
			(alertsPayload?.error_alerts.length || 0) +
				(alertsPayload?.rage_click_alerts.length || 0) +
				(alertsPayload?.new_user_alerts?.length || 0) +
				(alertsPayload?.user_properties_alerts.length || 0) +
				(alertsPayload?.session_feedback_alerts.length || 0) +
				(alertsPayload?.track_properties_alerts.length || 0) +
				(alertsPayload?.new_session_alerts.length || 0) >
				0
		) {
			setShouldCloseSetupPersisted(true)
			setShowModal(false)
		}
	}, [loading, alertsPayload, setShouldCloseSetupPersisted])

	const [showModal, setShowModal] = useState(!shouldCloseSetupPersisted)

	if (loading || shouldCloseSetupPersisted) {
		return null
	}

	const steps = [
		{
			title: 'Connect Slack',
			disableNextButton: !alertsPayload?.is_integrated_with_slack,
			content:
				!loading &&
				(!alertsPayload?.is_integrated_with_slack ? (
					<Alert
						trackingId="AlertSetupModalSlackIntegration"
						closable={false}
						message={"Slack isn't connected"}
						type="error"
						description={
							<>
								<p>
									Highlight needs to be connected with Slack
									in order to send you and your team messages.
								</p>
								<p>
									Once connected, you'll be able to get alerts
									for things like:
								</p>
								<ul>
									<li>Errors thrown</li>
									<li>New users</li>
									<li>A new feature is used</li>
									<li>User submitted feedback</li>
								</ul>
								<ConnectHighlightWithSlackButton
									className={styles.integrationButton}
								/>
							</>
						}
						className={styles.integrationAlert}
					/>
				) : (
					<Alert
						type="success"
						trackingId="DefaultAlertsSetupModal"
						message="You've integrated with Slack!"
						description="Let's move on and create some useful alerts!"
						closable={false}
					/>
				)),
		},
		{
			title: 'Select Alert Types',
			disableNextButton: selectedAlerts.length === 0,
			content: (
				<>
					<h3>Select Alert Types</h3>
					<p className={styles.stepDescription}>
						Select the types of alerts you want to be notified about
						for your project.
					</p>
					<div className={styles.cardGrid}>
						{Object.keys(ALERT_CONFIGURATIONS).map((_key) => {
							const key =
								_key as keyof typeof ALERT_CONFIGURATIONS as string
							const configuration = ALERT_CONFIGURATIONS[key]
							const alertColor = getAlertTypeColor(
								configuration.name,
							)

							if (configuration.name === 'Metric Monitor') {
								return null
							}

							if (
								configuration.name ===
									`${ALERT_NAMES.TRACK_PROPERTIES_ALERT}` ||
								configuration.name ===
									`${ALERT_NAMES.USER_PROPERTIES_ALERT}`
							) {
								return null
							}
							const cx = clsx.bind(styles)
							const isSelected = selectedAlerts.includes(key)

							return (
								<div
									className={styles.cardContent}
									key={key}
									onClick={() => {
										if (selectedAlerts.includes(key)) {
											setSelectedAlerts(
												selectedAlerts.filter(
													(predicate) => {
														return predicate !== key
													},
												),
											)
										} else {
											setSelectedAlerts([
												...selectedAlerts,
												key,
											])
										}
									}}
								>
									<AnimatePresence>
										{isSelected && (
											<motion.div
												className={
													styles.checkIconContainer
												}
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												exit={{ scale: 0 }}
											>
												<SvgCheck />
											</motion.div>
										)}
									</AnimatePresence>
									<Card
										className={cx(styles.cardContainer, {
											[styles.alertTypeSelected]:
												isSelected,
										})}
									>
										<h2 id={styles.title}>
											<span
												className={styles.icon}
												style={{
													backgroundColor: alertColor,
												}}
											>
												{ALERT_CONFIGURATIONS[key].icon}
											</span>
											{ALERT_CONFIGURATIONS[key].name}
										</h2>
										<p className={styles.description}>
											{
												ALERT_CONFIGURATIONS[key]
													.description
											}
										</p>
									</Card>
								</div>
							)
						})}
					</div>
				</>
			),
		},
		{
			title: 'Select Channels',
			content: (
				<>
					<h3>Channels to Notify</h3>
					<p className={styles.stepDescription}>
						Pick Slack channels or people to message when an alert
						is created.
					</p>
					<Select
						className={styles.channelSelect}
						options={channels}
						mode="multiple"
						onSearch={(value) => {
							setSearchQuery(value)
						}}
						filterOption={(searchValue, option) => {
							return !!option?.children
								?.toString()
								.toLowerCase()
								.includes(searchValue.toLowerCase())
						}}
						placeholder="Select a channel(s) or person(s) to send alerts to."
						onChange={onChannelsChange}
						defaultValue={selectedChannels}
						notFoundContent={
							channels?.length === 0 ? (
								<div
									className={clsx(
										styles.selectMessage,
										styles.notFoundMessage,
									)}
								>
									Slack is not configured yet.{' '}
									<a href={slackUrl}>
										Click here to sync with Slack
									</a>
									. After syncing, you can pick the channels
									or people to sent alerts to.
								</div>
							) : (
								<div
									className={clsx(
										styles.selectMessage,
										styles.notFoundMessage,
										styles.withSlackButton,
									)}
								>
									<SyncWithSlackButton
										isSlackIntegrated={
											alertsPayload?.is_integrated_with_slack ||
											false
										}
										slackUrl={slackUrl}
										refetchQueries={[
											namedOperations.Query
												.GetAlertsPagePayload,
										]}
									/>
								</div>
							)
						}
						dropdownRender={(menu) => (
							<div>
								{menu}
								{searchQuery.length === 0 &&
									channels.length > 0 && (
										<>
											<Divider
												style={{
													margin: '4px 0',
												}}
											/>
											<div
												className={styles.addContainer}
											>
												<SyncWithSlackButton
													isSlackIntegrated={
														alertsPayload?.is_integrated_with_slack ||
														false
													}
													slackUrl={slackUrl}
													refetchQueries={[
														namedOperations.Query
															.GetAlertsPagePayload,
													]}
												/>
											</div>
										</>
									)}
							</div>
						)}
					/>
				</>
			),
		},
	]

	return (
		<Modal
			visible={showModal}
			onCancel={() => {
				setShowModal(false)
			}}
			width={720}
		>
			<Steps
				type="navigation"
				current={current}
				steps={steps}
				finishButtonLabel="Create Alerts"
				onFinish={() => {
					createDefaultAlerts({
						variables: {
							project_id: currentProject!.id,
							slack_channels: channels
								.filter((predicate) => {
									return selectedChannels.includes(
										predicate.id,
									)
								})
								.map((value) => ({
									webhook_channel_id: `${value.value}`,
									webhook_channel_name: `${value.displayValue}`,
								})),
							alert_types: selectedAlerts,
							emails: [],
						},
					}).then(() => {
						setShouldCloseSetupPersisted(true)
					})
				}}
				disableFinishButton={
					selectedChannels.length < 1 || selectedAlerts.length < 1
				}
			/>
		</Modal>
	)
}

export default AlertSetupModal
