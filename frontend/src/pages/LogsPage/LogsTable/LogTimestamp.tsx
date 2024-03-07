import { Text } from '@highlight-run/ui/components'
import moment from 'moment'

const toYearMonthDay = (timestamp: string) => {
	const date = new Date(timestamp)
	return moment(date).format('YYYY-MM-DD HH:mm:ss')
}

type Props = {
	timestamp: string
}

const LogTimestamp = ({ timestamp }: Props) => {
	return (
		<Text color="weak" family="monospace">
			{toYearMonthDay(timestamp)}
		</Text>
	)
}

export { LogTimestamp }
