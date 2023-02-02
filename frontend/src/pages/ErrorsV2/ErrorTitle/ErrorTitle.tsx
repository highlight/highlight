import LoadingBox from '@components/LoadingBox'
import { GetErrorGroupQuery } from '@graph/operations'
import { ErrorObject } from '@graph/schemas'
import { Box, Heading } from '@highlight-run/ui'
import ErrorIssueButton from '@pages/ErrorsV2/ErrorIssueButton/ErrorIssueButton'
import ErrorShareButton from '@pages/ErrorsV2/ErrorShareButton/ErrorShareButton'
import { ErrorStateSelect } from '@pages/ErrorsV2/ErrorStateSelect/ErrorStateSelect'
import ErrorTag from '@pages/ErrorsV2/ErrorTag/ErrorTag'
import { getHeaderFromError } from '@pages/ErrorsV2/utils'
import { getErrorBody } from '@util/errors/errorUtils'
import React, { useMemo } from 'react'

interface Props {
	errorGroup: GetErrorGroupQuery['error_group']
	errorObject?: ErrorObject
}

const ErrorTitle = ({ errorGroup, errorObject }: Props) => {
	const event = errorObject?.event ?? errorGroup?.event
	const headerText = useMemo(() => {
		let header = getHeaderFromError(event ?? [])
		if (header && event) {
			const title = getErrorBody(event)
			if (title) {
				header = title
			}
		}
		return header
	}, [event])

	if (!errorGroup) {
		return <LoadingBox />
	}

	return (
		<Box mb="16">
			<Box borderBottom="secondary" pb="16">
				<Box display="flex" justifyContent="space-between">
					<ErrorTag errorGroup={errorGroup} />
					<Box display="flex" gap="8">
						<ErrorShareButton errorGroup={errorGroup} />
						<ErrorStateSelect
							state={errorGroup.state}
							snoozedUntil={errorGroup.snoozed_until}
						/>
						<ErrorIssueButton errorGroup={errorGroup} />
					</Box>
				</Box>
			</Box>
			<Box my="28">
				<Heading level="h2" lines="2">
					{headerText}
				</Heading>
			</Box>
		</Box>
	)
}

export default ErrorTitle
