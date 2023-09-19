import { CircularSpinner } from '@components/Loading/Loading'
import { Box } from '@highlight-run/ui'
import { Link } from 'react-router-dom'

import styles from './SlackLoadOrConnect.module.css'

interface Props {
	isLoading: boolean
	searchQuery: string
	isSlackIntegrated?: boolean
	slackUrl?: string
}

const SlackLoadOrConnect = ({
	isLoading,
	searchQuery,
	isSlackIntegrated,
	slackUrl,
}: Props) => {
	if (!isSlackIntegrated && slackUrl) {
		return <Link to={slackUrl}>Connect Highlight with Slack</Link>
	}
	return (
		<Box cssClass={[styles.selectMessage, styles.notFoundMessage]}>
			{!isLoading && searchQuery
				? `No results for "${searchQuery}"`
				: null}

			{isLoading ? (
				<Box display="flex" alignItems="center" gap="16">
					<CircularSpinner />
					No results... checking Slack
				</Box>
			) : null}
		</Box>
	)
}

export default SlackLoadOrConnect
