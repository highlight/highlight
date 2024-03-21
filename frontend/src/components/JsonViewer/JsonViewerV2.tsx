import { Box, Stack } from '@highlight-run/ui/components'

import {
	JsonViewerObject,
	JsonViewerValue,
	Props as JsonViewerObjectProps,
} from '@/components/JsonViewer/JsonViewerObject'

type Props = {
	attribute: JsonViewerObjectProps['attribute']
	allExpanded?: boolean
	matchedAttributes?: JsonViewerObjectProps['matchedAttributes']
	queryParts?: JsonViewerObjectProps['queryParts']
}

export const JsonViewerV2: React.FC<Props> = ({
	attribute,
	allExpanded = false,
	matchedAttributes = {},
	queryParts = [],
}) => {
	return (
		<Stack py="0" gap="1">
			{Object.entries(attribute).map(([key, value], index) => {
				const isObject = typeof value === 'object'

				return (
					<Box key={index}>
						{isObject ? (
							<JsonViewerObject
								allExpanded={allExpanded}
								attribute={value as object}
								label={key}
								matchedAttributes={matchedAttributes}
								queryParts={queryParts}
								queryBaseKeys={[key]}
							/>
						) : (
							<JsonViewerValue
								label={key}
								value={String(value)}
								queryKey={key}
								queryMatch={matchedAttributes[key]?.match}
								queryParts={queryParts}
							/>
						)}
					</Box>
				)
			})}
		</Stack>
	)
}
