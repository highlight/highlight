import { Text } from '@highlight-run/ui'
import { getUserProperties } from '@pages/Sessions/SessionsFeedV3/MinimalSessionCard/utils/utils'

type Props = {
	userProperties: string
}

const SessionEmailCell = ({ userProperties }: Props) => {
	const parsedUserProperties = getUserProperties(userProperties)

	return <Text>{parsedUserProperties.email}</Text>
}

export { SessionEmailCell }
