import { Tag } from '@highlight-run/ui'
import moment from 'moment'

const toYearMonthDay = (timestamp: string) => {
	const date = new Date(timestamp)
	return moment(date).format('YYYY-MM-DD HH:mm:ss')
}

type Props = {
	timestamp: string
}

const TimestampCell = ({ timestamp }: Props) => {
	return (
		<Tag shape="basic" kind="secondary">
			{toYearMonthDay(timestamp)}
		</Tag>
	)
}

export { TimestampCell }
