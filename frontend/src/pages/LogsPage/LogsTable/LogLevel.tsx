import { LogLevel as LogLevelType } from '@graph/schemas'
import { Text } from '@highlight-run/ui'
import { Box, BoxProps } from '@highlight-run/ui'
import React from 'react'

type Props = {
	level: LogLevelType
}

const COLOR_MAPPING: { [key in LogLevelType]: BoxProps['color'] } = {
	WARN: 'caution',
	DEBUG: 'strong',
	INFO: 'informative',
	ERROR: 'bad',
	FATAL: 'bad',
	TRACE: 'strong',
}

const LogLevel = ({ level }: Props) => {
	const color: BoxProps['color'] = COLOR_MAPPING[level] ?? 'default'

	return (
		<Box flexShrink={0} style={{ width: 46 }}>
			<Text color={color} weight="bold" family="monospace">
				{level}
			</Text>
		</Box>
	)
}

export { LogLevel }
