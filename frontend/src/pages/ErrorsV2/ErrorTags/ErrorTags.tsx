import { useGetErrorGroupTagsQuery } from '@graph/hooks'
import { GetErrorGroupQuery } from '@graph/operations'
import React from 'react'

interface Props {
	errorGroup: GetErrorGroupQuery['error_group']
}

export const ErrorTags = ({ errorGroup }: Props) => {
	const { data: tags } = useGetErrorGroupTagsQuery({
		variables: {
			project_id: `${errorGroup?.project_id}`,
			error_group_secure_id: `${errorGroup?.secure_id}`,
		},
		skip: !errorGroup?.secure_id,
	})

	return <>{JSON.stringify(tags)}</>
}
