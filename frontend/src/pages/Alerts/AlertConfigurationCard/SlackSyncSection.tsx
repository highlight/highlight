import { CircularSpinner } from '@components/Loading/Loading'
import clsx from 'clsx'
import React from 'react'
import { Link } from 'react-router-dom'

import styles from './SlackSyncSection.module.scss'

interface Props {
	isLoading: boolean
	searchQuery: string
	isSlackIntegrated?: boolean
	slackUrl?: string
}

const SlackSyncSection = ({
	isLoading,
	searchQuery,
	isSlackIntegrated,
	slackUrl,
}: Props) => {
	if (!isSlackIntegrated && slackUrl) {
		return <Link to={slackUrl}>Connect Highlight with Slack</Link>
	}
	return (
		<div className={clsx(styles.selectMessage, styles.notFoundMessage)}>
			{!isLoading && searchQuery
				? `No results for "${searchQuery}"`
				: null}

			{isLoading ? (
				<div className="-my-1 flex items-center gap-x-4">
					<CircularSpinner />
					No results... checking Slack
				</div>
			) : null}
		</div>
	)
}

export default SlackSyncSection
