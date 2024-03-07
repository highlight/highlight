import {
	Box,
	IconSolidFilter,
	MultiSelectButton,
} from '@highlight-run/ui/components'
import {
	LogLevelValue,
	titilize,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'

type Props = {
	logLevels: LogLevelValue[]
	setLogLevels: (values: LogLevelValue[]) => void
}

const FILTER_LABEL = 'Level'

const LogLevelFilter = ({ logLevels, setLogLevels }: Props) => {
	const handleRequestTypeChange = (valueNames: string[]) => {
		const allPreviouslySelected = logLevels.includes(LogLevelValue.All)
		const allCurrentlySelected = valueNames.includes(LogLevelValue.All)
		const clearOtherTypes = !allPreviouslySelected && allCurrentlySelected
		const deselectAllType = allPreviouslySelected && valueNames.length > 1

		if (!valueNames.length || clearOtherTypes) {
			return setLogLevels([LogLevelValue.All])
		}

		//-- Set type to be the logLevel value --//
		const updatedLogLevels = valueNames.filter(
			(name) => !deselectAllType || name !== LogLevelValue.All,
		) as LogLevelValue[]

		setLogLevels(updatedLogLevels)
	}

	const options = Object.entries(LogLevelValue).map(([logKey, logValue]) => ({
		key: logValue,
		clearsOnClick: logKey === LogLevelValue.All,
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
		if (logLevels.includes(LogLevelValue.All)) {
			return FILTER_LABEL
		}

		if (logLevels.length === 1) {
			return `${FILTER_LABEL}: ${titilize(logLevels[0])}`
		}

		return `${FILTER_LABEL}: ${logLevels.length} selected`
	}

	return (
		<MultiSelectButton
			label={FILTER_LABEL}
			icon={<IconSolidFilter />}
			defaultValue={options[0].key}
			value={logLevels}
			valueRender={valueRender}
			options={options}
			onChange={handleRequestTypeChange}
		/>
	)
}

export { LogLevelFilter }
