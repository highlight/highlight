import { LogSource } from '@graph/schemas'
import {
	Box,
	IconSolidFilter,
	MultiSelectButton,
} from '@highlight-run/ui/components'

type Props = {
	logSources: LogSource[]
	setLogSources: (values: LogSource[]) => void
}

const FILTER_LABEL = 'Source'

const LogSourceFilter = ({ logSources, setLogSources }: Props) => {
	const handleRequestTypeChange = (valueNames: string[]) => {
		if (!valueNames.length) {
			return setLogSources(logSources)
		}

		setLogSources(valueNames as LogSource[])
	}

	const options = Object.entries(LogSource).map(([logKey, logValue]) => ({
		key: logValue,
		render: (
			<Box
				display="flex"
				justifyContent="space-between"
				width="full"
				gap="8"
			>
				<span>{logKey}</span>
			</Box>
		),
	}))

	return (
		<MultiSelectButton
			label={FILTER_LABEL}
			icon={<IconSolidFilter />}
			defaultValue={options[0].key}
			value={logSources}
			selected={!!logSources.length}
			options={options}
			onChange={handleRequestTypeChange}
		/>
	)
}

export { LogSourceFilter }
