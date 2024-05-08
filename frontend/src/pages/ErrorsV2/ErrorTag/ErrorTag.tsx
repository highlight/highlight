import LoadingBox from '@components/LoadingBox'
import { useGetProjectQuery } from '@graph/hooks'
import { GetErrorGroupQuery } from '@graph/operations'
import {
	Box,
	IconSolidCheveronRight,
	IconSolidDesktopComputer,
	IconSolidLocationMarker,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { getProjectPrefix } from '@pages/ErrorsV2/utils'
import React from 'react'

const ErrorTag = React.memo(
	({ errorGroup }: { errorGroup: GetErrorGroupQuery['error_group'] }) => {
		const { data: projectData } = useGetProjectQuery({
			variables: { id: String(errorGroup?.project_id) },
			skip: !errorGroup,
		})

		if (!errorGroup) return <LoadingBox />
		return (
			<Box
				alignItems="center"
				display="flex"
				gap="4"
				color="weak"
				flexWrap="nowrap"
			>
				<Tag
					iconLeft={<IconSolidLocationMarker />}
					kind="secondary"
					size="medium"
					shape="basic"
					lines="1"
				>
					{errorGroup.type}
				</Tag>

				<IconSolidCheveronRight />
				{errorGroup?.error_tag?.title && (
					<Tag
						shape="basic"
						kind="secondary"
						emphasis="medium"
						iconLeft={<IconSolidDesktopComputer size={12} />}
						lines="1"
					>
						{errorGroup.error_tag.title}
					</Tag>
				)}
				<Text size="small" weight="medium" color="moderate" lines="1">
					{getProjectPrefix(projectData?.project)}-{errorGroup.id}
				</Text>
			</Box>
		)
	},
)
export default ErrorTag
