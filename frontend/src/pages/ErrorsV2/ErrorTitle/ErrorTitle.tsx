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
		<Box>
			<Text font="h2">{headerTextAsJson || headerText}</Text>
		</Box>
		// <header className={styles.header}>
		// 	<div className={styles.secondRow}>
		// 		{errorGroup?.type && (
		// 			<Tag
		// 				infoTooltipText="This is where the error was thrown."
		// 				backgroundColor="var(--color-orange-300)"
		// 			>
		// 				{errorGroup.type}
		// 			</Tag>
		// 		)}
		// 	</div>

		// 	<div className={styles.topRow}>
		// 		<h3>{headerTextAsJson || headerText}</h3>
		// 	</div>
		// </header>
	)
}

export default ErrorTitle
