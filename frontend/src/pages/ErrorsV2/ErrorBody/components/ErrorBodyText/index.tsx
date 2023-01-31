import { Button } from '@components/Button'
import { ErrorGroup, Maybe } from '@graph/schemas'
import { Box, Text } from '@highlight-run/ui'
import { getErrorBody } from '@util/errors/errorUtils'
import { useEffect, useRef, useState } from 'react'

interface Props {
	errorGroup?: Maybe<Omit<ErrorGroup, 'metadata_log'>>
}

const ErrorBodyText = ({ errorGroup }: Props) => {
	const [truncated, setTruncated] = useState(true)
	const [truncateable, setTruncateable] = useState(true)
	const body = getErrorBody(errorGroup?.event)
	const bodyRef = useRef<HTMLElement | undefined>()

	useEffect(() => {
		if (bodyRef.current) {
			setTruncateable(
				bodyRef.current.offsetHeight + 5 < bodyRef.current.scrollHeight,
			)
		}
	}, [body])

	return (
		<>
			<Text
				family="monospace"
				lines={truncated ? '3' : undefined}
				ref={bodyRef}
				break="word"
			>
				{body}
			</Text>

			{truncateable && (
				<Box display="flex">
					<Button
						onClick={() => setTruncated(!truncated)}
						kind="secondary"
						emphasis="medium"
						size="xSmall"
						trackingId="errorBodyToggleContent"
					>
						Show {truncated ? 'more' : 'less'}
					</Button>
				</Box>
			)}
		</>
	)
}

export default ErrorBodyText
