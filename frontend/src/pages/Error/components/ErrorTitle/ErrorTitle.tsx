import Tag from '@components/Tag/Tag'
import { ErrorGroup, ErrorObject, Maybe } from '@graph/schemas'
import { getHeaderFromError } from '@pages/ErrorsV2/utils'
import { getErrorBody } from '@util/errors/errorUtils'
import React, { useEffect, useState } from 'react'

import styles from './ErrorTitle.module.scss'

interface Props {
	errorGroup:
		| Maybe<Pick<ErrorGroup, 'event' | 'type' | 'secure_id' | 'is_public'>>
		| undefined
	showShareButton?: boolean
	errorObject?: ErrorObject
}

const ErrorTitle = ({
	errorGroup,
	showShareButton = true,
	errorObject,
}: Props) => {
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
		<header className={styles.header}>
			<div className={styles.topRow}>
				{!showShareButton ? (
					<h3>{headerTextAsJson || headerText}</h3>
				) : (
					<h2>{headerTextAsJson || headerText}</h2>
				)}
			</div>
			<div className={styles.secondRow}>
				{errorGroup?.type && (
					<Tag
						infoTooltipText="This is where the error was thrown."
						backgroundColor="var(--color-orange-300)"
					>
						{errorGroup.type}
					</Tag>
				)}
			</div>
		</header>
	)
}

export default ErrorTitle
