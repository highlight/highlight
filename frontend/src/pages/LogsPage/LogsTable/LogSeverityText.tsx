import { SeverityText } from '@graph/schemas'
import { Text } from '@highlight-run/ui'
import { Box, BoxProps } from '@highlight-run/ui'
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
		<Box flexShrink={0} style={{ width: 46 }}>
			<Text color={color} weight="bold" family="monospace">
				{severityText}
			</Text>
		</Box>
	)
}

export { LogSeverityText }
