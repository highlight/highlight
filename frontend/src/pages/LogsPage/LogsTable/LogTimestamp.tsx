import { Text } from '@highlight-run/ui'
import moment from 'moment'
import React from 'react'

const toYearMonthDay = (timestamp: string) => {
	const date = new Date(timestamp)
	return moment(date).format('YYYY-MM-DD HH:mm:ss')
}

type Props = {
	timestamp: string
}

const LogTimestamp = ({ timestamp }: Props) => {
	return (
		<Text color="weak" weight="bold" family="monospace">
			{toYearMonthDay(timestamp)}
		</Text>
	)
}

export { LogTimestamp }
