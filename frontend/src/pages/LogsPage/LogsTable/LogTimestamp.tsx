import { Text } from '@highlight-run/ui'
import React from 'react'

const toYearMonthDay = (timestamp: string) => {
	const date = new Date(timestamp)
	const dateString = date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	})
	const timeString = date.toLocaleTimeString('en-US', {
		hour12: false,
	})

	return `${dateString} ${timeString}`
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
