import { Button } from '@components/Button'
import { ErrorGroup, Maybe } from '@graph/schemas'
import { Box, Text } from '@highlight-run/ui'
import { getErrorBody } from '@util/errors/errorUtils'
import { useEffect, useRef, useState } from 'react'

import * as style from './style.css'

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
		<Box display="flex" flexDirection="column" gap="8">
			<Box
				py="8"
				cssClass={style.errorBodyContainer}
				overflowY="scroll"
				overflowX="auto"
			>
				<Text
					family="monospace"
					lines={truncated ? '3' : undefined}
					ref={bodyRef}
					size="xSmall"
					color="moderate"
				>
					{body}
				</Text>
			</Box>

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
		</Box>
	)
}

export default ErrorBodyText
