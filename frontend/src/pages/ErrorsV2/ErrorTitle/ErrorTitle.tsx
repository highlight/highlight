import { useGetProjectQuery } from '@graph/hooks'
import { GetErrorGroupQuery } from '@graph/operations'
import { ErrorObject } from '@graph/schemas'
import { Box, Heading, Tag, Text } from '@highlight-run/ui'
import ErrorIssueButton from '@pages/ErrorsV2/ErrorIssueButton/ErrorIssueButton'
import ErrorShareButton from '@pages/ErrorsV2/ErrorShareButton/ErrorShareButton'
import { ErrorStateSelect } from '@pages/ErrorsV2/ErrorStateSelect/ErrorStateSelect'
import { getHeaderFromError, getProjectPrefix } from '@pages/ErrorsV2/utils'
import { getErrorBody } from '@util/errors/errorUtils'
import React, { useEffect, useState } from 'react'
import { FaMapMarker } from 'react-icons/fa'

interface Props {
	errorGroup: GetErrorGroupQuery['error_group']
	errorObject?: ErrorObject
}

const ErrorTitle = ({ errorGroup, errorObject }: Props) => {
	const [headerTextAsJson, setHeaderTextAsJson] = useState<null | any>(null)
	const { data: projectData } = useGetProjectQuery({
		variables: { id: String(errorGroup?.project_id) },
	})

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
			<Box borderBottom="secondary" pb="16">
				<Box display="flex" justifyContent="space-between">
					<Box alignItems="center" display="flex" gap="10">
						<Tag
							iconLeft={<FaMapMarker />}
							kind="secondary"
							size="medium"
							shape="basic"
						>
							{errorGroup.type}
						</Tag>

						<Box>
							<Text>
								{getProjectPrefix(projectData?.project)}-
								{errorGroup.id}
							</Text>
						</Box>
					</Box>

					<Box display="flex" gap="8">
						<ErrorStateSelect
							state={errorGroup.state}
							snoozedUntil={errorGroup.snoozed_until}
						/>
						<ErrorShareButton errorGroup={errorGroup} />
						<ErrorIssueButton errorGroup={errorGroup} />
					</Box>
				</Box>
			</Box>
			<Box my="28">
				<Heading level="h2" lines="2">
					{headerTextAsJson || headerText}
				</Heading>
			</Box>
		</Box>
	)
}

export default ErrorTitle
