import { CircularSpinner } from '@components/Loading/Loading'
import clsx from 'clsx'
import React from 'react'

import styles from './SlackSyncSection.module.scss'

interface Props {
	isLoading: boolean
	searchQuery: string
	isSlackIntegrated?: boolean
	slackUrl?: string
}

const SlackSyncSection = ({ isLoading, searchQuery }: Props) => {
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
