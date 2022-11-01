import { ErrorGroup, ErrorObject, Maybe } from '@graph/schemas'
import {
	Box,
	Button,
	Heading,
	IconCreateFile,
	IconShare,
	Text,
} from '@highlight-run/ui'
import { getHeaderFromError } from '@pages/Error/ErrorPage'
import { ErrorStateSelect } from '@pages/ErrorsV2/ErrorStateSelect/ErrorStateSelect'
import { getErrorBody } from '@util/errors/errorUtils'
import React, { useEffect, useState } from 'react'
import { FaArrowRight } from 'react-icons/fa'

interface Props {
	errorGroup:
		| Maybe<
				Pick<
					ErrorGroup,
					'event' | 'type' | 'secure_id' | 'is_public' | 'state'
				>
		  >
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
							<Text>Back end</Text>
						</Box>

						<Box>
							<Text>Error groups {'>'} HIG-1234</Text>
						</Box>
					</Box>

					<Box display="flex" gap="8">
						{errorGroup?.state && (
							<ErrorStateSelect state={errorGroup.state} />
						)}
						<Button
							size="small"
							variant="grey"
							iconRight={<IconShare />}
						>
							Share
						</Button>
						<Button
							size="small"
							variant="white"
							iconLeft={<IconCreateFile />}
						>
							Create Issue
						</Button>
					</Box>
				</Box>
			</Box>
			<Heading size="h2" paddingBottom="16">
				{headerTextAsJson || headerText}
			</Heading>
		</Box>
	)
}

export default ErrorTitle
