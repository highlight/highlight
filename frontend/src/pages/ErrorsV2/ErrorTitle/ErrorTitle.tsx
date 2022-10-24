import { ErrorGroup, ErrorObject, Maybe } from '@graph/schemas'
import { Box, Text } from '@highlight-run/ui'
import { getHeaderFromError } from '@pages/Error/ErrorPage'
import { getErrorBody } from '@util/errors/errorUtils'
import React, { useEffect, useState } from 'react'

interface Props {
	errorGroup:
		| Maybe<Pick<ErrorGroup, 'event' | 'type' | 'secure_id' | 'is_public'>>
		| undefined
	errorObject?: ErrorObject
}

const ErrorTitle = ({ errorGroup, errorObject }: Props) => {
	const [headerTextAsJson, setHeaderTextAsJson] = useState<null | any>(null)

	const event = errorObject?.event ?? errorGroup?.event
	const headerText = getHeaderFromError(event ?? [])

	useEffect(() => {
		if (headerText) {
			if (event) {
				const title = getErrorBody(event)
				if (title) {
					setHeaderTextAsJson(title)
				} else {
					setHeaderTextAsJson(null)
				}
			} else {
				setHeaderTextAsJson(null)
			}
		}
	}, [event, headerText])

	return (
		<Box my="xLarge">
			<Text variant="h2">{headerTextAsJson || headerText}</Text>
		</Box>
	)
}

export default ErrorTitle
