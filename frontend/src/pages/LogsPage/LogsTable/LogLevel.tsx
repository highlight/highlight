import { LogLevel as LogLevelType } from '@graph/schemas'
import { Box, Text } from '@highlight-run/ui/components'
import { COLOR_MAPPING } from '@pages/LogsPage/constants'

type Props = {
	level: LogLevelType
}

const LogLevel = ({ level }: Props) => {
	const color = COLOR_MAPPING[level]

	return (
		<Box flexShrink={0} style={{ color, width: 46 }}>
			<Text family="monospace">{level.toUpperCase()}</Text>
		</Box>
	)
}

export { LogLevel }
