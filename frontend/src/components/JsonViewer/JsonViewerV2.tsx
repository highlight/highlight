import { Box, Stack } from '@highlight-run/ui/components'

import {
	JsonViewerObject,
	Props as JsonViewerObjectProps,
	JsonViewerValue,
} from '@/components/JsonViewer/JsonViewerObject'

type Props = {
	attribute: JsonViewerObjectProps['attribute']
	allExpanded?: boolean
	matchedAttributes?: JsonViewerObjectProps['matchedAttributes']
	query?: string
	setQuery?: JsonViewerObjectProps['setQuery']
}

export const JsonViewerV2: React.FC<Props> = ({
	attribute,
	allExpanded = false,
	matchedAttributes = {},
	query = '',
	setQuery,
}) => {
	return (
		<Stack py="0" gap="1">
			{Object.entries(attribute ?? {}).map(([key, value], index) => {
				const isObject = typeof value === 'object'

				return (
					<Box key={index}>
						{isObject ? (
							<JsonViewerObject
								allExpanded={allExpanded}
								attribute={value as object}
								label={key}
								matchedAttributes={matchedAttributes}
								query={query}
								queryBaseKeys={[key]}
								setQuery={setQuery}
							/>
						) : (
							<JsonViewerValue
								label={key}
								value={String(value)}
								query={query}
								queryKey={key}
								queryMatch={matchedAttributes[key]?.match}
								setQuery={setQuery}
							/>
						)}
					</Box>
				)
			})}
		</Stack>
	)
}
