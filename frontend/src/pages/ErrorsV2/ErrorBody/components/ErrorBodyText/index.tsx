import { Maybe } from '@graph/schemas'
import { Box, Tag, Text } from '@highlight-run/ui/components'
import { getErrorBody } from '@util/errors/errorUtils'
import { useEffect, useRef, useState } from 'react'

interface Props {
	errorBody: Maybe<string>[]
}

const ErrorBodyText = ({ errorBody }: Props) => {
	const [truncated, setTruncated] = useState(true)
	const [truncateable, setTruncateable] = useState(true)
	const body = getErrorBody(errorBody)
	const bodyRef = useRef<HTMLElement | undefined>(undefined)

	useEffect(() => {
		if (bodyRef.current) {
			setTruncateable(
				bodyRef.current.offsetHeight + 5 < bodyRef.current.scrollHeight,
			)
		}
	}, [body])

	return (
		<Box display="flex" flexDirection="column" gap="8">
			<Box py="8">
				<Text
					family="monospace"
					lines={truncated ? '3' : undefined}
					ref={bodyRef}
					size="small"
					color="moderate"
				>
					{body}
				</Text>
			</Box>

			{truncateable && (
				<Box display="flex">
					<Tag
						onClick={() => setTruncated(!truncated)}
						kind="secondary"
						emphasis="medium"
						shape="basic"
					>
						Show {truncated ? 'more' : 'less'}
					</Tag>
				</Box>
			)}
		</Box>
	)
}

export default ErrorBodyText
