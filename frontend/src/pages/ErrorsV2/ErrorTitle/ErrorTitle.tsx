import { GetErrorGroupQuery } from '@graph/operations'
import { ErrorObject } from '@graph/schemas'
import { Box, Heading, Text } from '@highlight-run/ui'
import { getHeaderFromError } from '@pages/Error/ErrorPage'
import ErrorIssueButton from '@pages/ErrorsV2/ErrorIssueButton/ErrorIssueButton'
import ErrorShareButton from '@pages/ErrorsV2/ErrorShareButton/ErrorShareButton'
import { ErrorStateSelect } from '@pages/ErrorsV2/ErrorStateSelect/ErrorStateSelect'
import { getErrorBody } from '@util/errors/errorUtils'
import React, { useEffect, useState } from 'react'
import { FaArrowRight } from 'react-icons/fa'

interface Props {
	errorGroup: GetErrorGroupQuery['error_group']
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

	if (!errorGroup) {
		// TODO: Render loading state
		return null
	}

	return (
		<Box mb="16">
			<Box borderBottom="neutral" pb="16" marginBottom="24">
				<Box display="flex" justifyContent="space-between">
					<Box alignItems="center" display="flex" gap="10">
						<Box
							alignItems="center"
							border="neutral"
							borderRadius="round"
							display="inline-flex"
							gap="6"
							py="4"
							px="8"
						>
							<Box
								alignItems="center"
								background="purple500"
								color="white"
								display="inline-block"
								borderRadius="round"
								p="4"
							>
								<Text size="xxSmall">
									<FaArrowRight />
								</Text>
							</Box>
							<Text>{errorGroup.type}</Text>
						</Box>

						<Box>
							<Text>Error groups {'>'} HIG-1234</Text>
						</Box>
					</Box>

					<Box display="flex" gap="8">
						<ErrorStateSelect state={errorGroup.state} />
						<ErrorShareButton errorGroup={errorGroup} />
						<ErrorIssueButton errorGroup={errorGroup} />
					</Box>
				</Box>
			</Box>
			<Box mb="16">
				<Heading level="h2" lines="2">
					{headerTextAsJson || headerText}
				</Heading>
			</Box>
		</Box>
	)
}

export default ErrorTitle
