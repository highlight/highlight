import { LogSource } from '@graph/schemas'
import {
	Box,
	IconSolidFilter,
	MultiSelectButton,
} from '@highlight-run/ui/components'
import { titilize } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'

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

	const valueRender = () => {
		if (logSources.length === 1) {
			return `${FILTER_LABEL}: ${titilize(logSources[0])}`
		}

		return `${FILTER_LABEL}: ${logSources.length} selected`
	}

	return (
		<MultiSelectButton
			label={FILTER_LABEL}
			icon={<IconSolidFilter />}
			defaultValue={options[0].key}
			value={logSources}
			valueRender={valueRender}
			options={options}
			onChange={handleRequestTypeChange}
		/>
	)
}

export { LogSourceFilter }
