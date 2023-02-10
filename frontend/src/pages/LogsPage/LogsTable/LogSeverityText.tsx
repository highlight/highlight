import { Text } from '@highlight-run/ui'
import React from 'react'

type Props = {
	severityText: string
}

const LogSeverityText = ({ severityText }: Props) => {
	return <Text color="caution">{severityText}</Text>
}

export { LogSeverityText }
