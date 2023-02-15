import { Text } from '@highlight-run/ui'
import React from 'react'

const padTo2Digits = (num: number) => {
	return num.toString().padStart(2, '0')
}

const toYearMonthDay = (timestamp: string) => {
	const date = new Date(timestamp)
	const year = date.getFullYear()
	const month = padTo2Digits(date.getMonth() + 1)
	const day = padTo2Digits(date.getDate())

	return `${year}-${month}-${day}`
}

type Props = {
	timestamp: string
}

const LogTimestamp = ({ timestamp }: Props) => {
	return <Text color="weak">{toYearMonthDay(timestamp)}</Text>
}

export { LogTimestamp }
