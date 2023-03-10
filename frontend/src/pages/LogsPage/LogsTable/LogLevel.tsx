import { LogLevel as LogLevelType } from '@graph/schemas'
import { Text } from '@highlight-run/ui'
import { Box, BoxProps } from '@highlight-run/ui'
import { LOG_PAGE_COLOR_MAPPING } from '@pages/LogsPage/constants'
import React from 'react'

type Props = {
	level: LogLevelType
}

const LogLevel = ({ level }: Props) => {
	const color: BoxProps['color'] = LOG_PAGE_COLOR_MAPPING[level] ?? 'default'

	return (
		<Box flexShrink={0} style={{ width: 46 }}>
			<Text color={color} weight="bold" family="monospace">
				{level}
			</Text>
		</Box>
	)
}

export { LogLevel }
