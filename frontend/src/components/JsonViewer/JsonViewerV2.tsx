import { Box } from '@highlight-run/ui/components'

import {
	LogDetailsObject,
	LogDetailsProps,
	LogValue,
} from '@/pages/LogsPage/LogsTable/LogDetails'

type JsonViewerProps = {
	attribute: LogDetailsProps['attribute']
	allExpanded?: boolean
	matchedAttributes?: LogDetailsProps['matchedAttributes']
	queryParts?: LogDetailsProps['queryParts']
}

export const JsonViewerV2: React.FC<JsonViewerProps> = ({
	attribute,
	allExpanded = false,
	matchedAttributes = {},
	queryParts = [],
}) => {
	return (
		<>
			{Object.entries(attribute).map(([key, value], index) => {
				const isObject = typeof value === 'object'

				return (
					<Box key={index}>
						{isObject ? (
							<LogDetailsObject
								allExpanded={allExpanded}
								attribute={value as object}
								label={key}
								matchedAttributes={matchedAttributes}
								queryParts={queryParts}
								queryBaseKeys={[key]}
							/>
						) : (
							<LogValue
								label={key}
								value={String(value)}
								queryKey={key}
								queryParts={queryParts}
							/>
						)}
					</Box>
				)
			})}
		</>
	)
}
