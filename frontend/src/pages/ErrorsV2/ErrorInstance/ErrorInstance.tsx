import { useGetProjectQuery } from '@graph/hooks'
import { Heading, Text } from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { getProjectPrefix } from '@pages/ErrorsV2/utils'
import React from 'react'

type Props = React.PropsWithChildren & {
	errorObjectId: number
}

const ErrorInstance: React.FC<Props> = ({ errorObjectId }) => {
	const { projectId } = useProjectId()
	const { data: projectData } = useGetProjectQuery({
		variables: { id: projectId },
	})

	return (
		<div>
			<Heading level="h4">Error Instance</Heading>
			<Text>
				Error groups {'>'} {getProjectPrefix(projectData.project)}-
				{errorObject.error_group_id}
			</Text>
		</div>
	)
}

export default ErrorInstance
