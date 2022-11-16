import JsonViewer from '@components/JsonViewer/JsonViewer'
import { Box, ButtonLink, Text } from '@highlight-run/ui'
import { parseOptionalJSON } from '@util/string'
import React from 'react'

type Props = React.PropsWithChildren & {
	jsonOrText: string
}

const JsonOrTextCard: React.FC<Props> = ({ jsonOrText }) => {
	const content = parseOptionalJSON(jsonOrText || '')
	const [truncated, setTruncated] = React.useState(true)
	const [truncateable, setTruncateable] = React.useState(true)
	const textRef = React.useRef<HTMLElement | undefined>()

	React.useEffect(() => {
		if (textRef.current) {
			setTruncateable(
				textRef.current.offsetHeight + 5 < textRef.current.scrollHeight,
			)
		}
	}, [jsonOrText])

	return (
		<Box border="neutral" p="12" borderRadius="5">
			{typeof content !== 'object' ? (
				<>
					<Text
						lines={truncated ? '2' : undefined}
						family="monospace"
					>
						{jsonOrText}
					</Text>

					{truncateable && (
						<Box mt="12">
							<ButtonLink
								onClick={() => setTruncated(!truncated)}
							>
								Show {truncated ? 'more' : 'less'}
							</ButtonLink>
						</Box>
					)}
				</>
			) : (
				<JsonViewer src={content} collapsed={2} />
			)}
		</Box>
	)
}

export default JsonOrTextCard
