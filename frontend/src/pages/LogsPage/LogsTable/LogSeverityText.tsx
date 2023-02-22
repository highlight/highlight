import { SeverityText } from '@graph/schemas'
import { Text } from '@highlight-run/ui'
import { BoxProps } from '@highlight-run/ui/src/components/Box/Box'
import React from 'react'

type Props = {
	severityText: SeverityText
}

const COLOR_MAPPING: { [key in SeverityText]: BoxProps['color'] } = {
	WARN: 'caution',
	DEBUG: 'strong',
	INFO: 'informative',
	ERROR: 'bad',
	FATAL: 'bad',
	TRACE: 'strong',
}

const LogSeverityText = ({ severityText }: Props) => {
	const color: BoxProps['color'] = COLOR_MAPPING[severityText] ?? 'default'

	return (
		<Text color={color} weight="bold" family="monospace">
			{severityText}
		</Text>
	)
}

export { LogSeverityText }
