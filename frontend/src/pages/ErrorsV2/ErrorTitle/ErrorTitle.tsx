import Button from '@components/Button/Button/Button'
import { ErrorGroup, ErrorObject, Maybe } from '@graph/schemas'
import { Box, Heading, Text } from '@highlight-run/ui'
import { getHeaderFromError } from '@pages/Error/ErrorPage'
import { getErrorBody } from '@util/errors/errorUtils'
import React, { useEffect, useState } from 'react'
import { FaArrowRight } from 'react-icons/fa'

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
		<Box my="16">
			<Box borderBottom="neutral" py="16" marginBottom="24">
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
							<Text>Back end</Text>
						</Box>

						<Box>
							<Text>Error groups {'>'} HIG-1234</Text>
						</Box>
					</Box>

					<Box display="flex" gap="8">
						<Button
							size="small"
							trackingId="test"
							onClick={() => null}
						>
							Open
						</Button>
						<Button
							size="small"
							trackingId="test"
							onClick={() => null}
						>
							Share
						</Button>
						<Button
							size="small"
							trackingId="test"
							onClick={() => null}
						>
							Create Issue
						</Button>
					</Box>
				</Box>
			</Box>
			<Heading size="h2">{headerTextAsJson || headerText}</Heading>
		</Box>
	)
}

export default ErrorTitle
