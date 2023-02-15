import Button from '@components/Button/Button/Button'
import { DEMO_WORKSPACE_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import Tooltip from '@components/Tooltip/Tooltip'
import { useSyncSlackIntegrationMutation } from '@graph/hooks'
import Reload from '@icons/Reload'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import clsx from 'clsx'
import React from 'react'

import styles from './SyncWithSlackButton.module.scss'

interface Props {
	slackUrl: string
	isSlackIntegrated: boolean
	refetchQueries: string[]
	small?: boolean
}

const SyncWithSlackButton = ({
	slackUrl,
	isSlackIntegrated,
	refetchQueries,
	small,
}: Props) => {
	const { project_id } = useParams<{ project_id: string }>()
	const [syncSlackIntegration, { loading }] = useSyncSlackIntegrationMutation(
		{
			variables: {
				project_id: project_id!,
			},
			refetchQueries,
		},
	)

	const onClick = async () => {
		try {
			const { data } = await syncSlackIntegration()

			if (data?.syncSlackIntegration.newChannelsAddedCount) {
				message.success(
					`Synced ${data.syncSlackIntegration.newChannelsAddedCount} Slack channels/people with Highlight!`,
				)
			} else {
				message.success(
					'Synced with Slack! No new Slack channels/people found.',
				)
			}
		} catch {
			message.error(
				'Something went wrong when syncing with Slack, try again?',
			)
		}
	}

	return (
		<div
			className={clsx(styles.selectMessage, styles.notFoundMessage, {
				[styles.small]: small,
			})}
		>
			{small ? null : "Can't find the channel or person here? "}
			{project_id !== DEMO_WORKSPACE_APPLICATION_ID &&
				(!isSlackIntegrated ? (
					<a href={slackUrl}>Connect Highlight with Slack</a>
				) : (
					<Button
						className={styles.syncButton}
						trackingId="SyncHighlightWithSlack"
						type="text"
						onClick={onClick}
						loading={loading}
					>
						{small ? (
							<Tooltip title="Refresh the channels & people in your Slack Workspace.">
								<Reload />
							</Tooltip>
						) : (
							'Sync Highlight with Slack'
						)}
					</Button>
				))}
			{!small && '.'}
		</div>
	)
}

export default SyncWithSlackButton
