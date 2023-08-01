import { Box, IconSolidFilter, MultiSelectButton } from '@highlight-run/ui'
import {
	LogSourceValue,
	titilize,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import React from 'react'

type Props = {
	logSources: LogSourceValue[]
	setLogSources: (values: LogSourceValue[]) => void
}

const FILTER_LABEL = 'Source'

const LogSourceFilter = ({ logSources, setLogSources }: Props) => {
	const handleRequestTypeChange = (valueNames: string[]) => {
		const allPreviouslySelected = logSources.includes(LogSourceValue.All)
		const allCurrentlySelected = valueNames.includes(LogSourceValue.All)
		const clearOtherTypes = !allPreviouslySelected && allCurrentlySelected
		const deselectAllType = allPreviouslySelected && valueNames.length > 1

		if (!valueNames.length || clearOtherTypes) {
			return setLogSources([LogSourceValue.All])
		}

		//-- Set type to be the logLevel value --//
		const updatedLogSources = valueNames.filter(
			(name) => !deselectAllType || name !== LogSourceValue.All,
		) as LogSourceValue[]

		setLogSources(updatedLogSources)
	}

	const options = Object.entries(LogSourceValue).map(
		([logKey, logValue]) => ({
			key: logValue,
			clearsOnClick: logKey === LogSourceValue.All,
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
		}),
	)

	const valueRender = () => {
		if (logSources.includes(LogSourceValue.All)) {
			return FILTER_LABEL
		}

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
