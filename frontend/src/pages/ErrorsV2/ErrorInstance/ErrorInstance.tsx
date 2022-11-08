import { Avatar } from '@components/Avatar/Avatar'
import {
	useGetErrorObjectQuery,
	useGetProjectQuery,
	useGetRecentErrorsQuery,
} from '@graph/hooks'
import { GetErrorGroupQuery, GetErrorObjectQuery } from '@graph/operations'
import {
	Badge,
	Box,
	Button,
	Heading,
	IconArrowsExpand,
	IconPlay,
	Text,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import ErrorStackTrace from '@pages/ErrorsV2/ErrorStackTrace/ErrorStackTrace'
import { getProjectPrefix } from '@pages/ErrorsV2/utils'
import {
	getDisplayName,
	getIdentifiedUserProfileImage,
} from '@pages/Sessions/SessionsFeedV2/components/MinimalSessionCard/utils/utils'
import { useParams } from '@util/react-router/useParams'
import React from 'react'

type Props = React.PropsWithChildren & {
	errorGroup: GetErrorGroupQuery['error_group']
}

const ErrorInstance: React.FC<Props> = ({ errorGroup }) => {
	const { projectId } = useProjectId()
	const { error_secure_id } = useParams<{ error_secure_id: string }>()
	const [selectedErrorObjectIndex, setSelectedErrorObjectIndex] =
		React.useState<number>(0)

	const { data: projectData } = useGetProjectQuery({
		variables: { id: projectId },
	})

	// TODO: Figure out a better way of pulling the error objects and paging
	// through them.
	const { data: recentErrorsData } = useGetRecentErrorsQuery({
		variables: { secure_id: error_secure_id },
		skip: !error_secure_id,
		onCompleted: () => {
			setSelectedErrorObjectIndex(0)
		},
	})

	const metadataLog = recentErrorsData?.error_group?.metadata_log || []
	console.log(
		selectedErrorObjectIndex,
		metadataLog[selectedErrorObjectIndex]?.error_id,
	)
	const { data } = useGetErrorObjectQuery({
		variables: {
			id: String(metadataLog[selectedErrorObjectIndex]?.error_id),
		},
	})

	const projectPrefix = getProjectPrefix(projectData?.project)

	return (
		<Box>
			<Box mt="28" mb="32" display="flex" justifyContent="space-between">
				<Box display="flex" flexDirection="column" gap="16">
					<Heading level="h4">Error Instance</Heading>

					<Text>
						Error groups {'>'} {projectPrefix}-
						{data?.error_object?.error_group_id} {' > '}
						{projectPrefix}-Ins-{data?.error_object?.id}
					</Text>
				</Box>

				<Box>
					<Button
						onClick={() =>
							setSelectedErrorObjectIndex(
								selectedErrorObjectIndex - 1,
							)
						}
					>
						Older
					</Button>
					<Button
						onClick={() =>
							setSelectedErrorObjectIndex(
								selectedErrorObjectIndex + 1,
							)
						}
					>
						Newer
					</Button>
					{/* TODO: Build link component that looks like a button, or use history to navigate */}
					<Button onClick={() => null} iconLeft={<IconPlay />}>
						Show Session
					</Button>
				</Box>
			</Box>

			<Tags errorObject={data?.error_object} />

			<Box display="flex" my="32">
				<User errorObject={data?.error_object} />
			</Box>

			<Text size="large" weight="bold">
				Stack trace
			</Text>
			<Box bt="neutral" mt="12" pt="16">
				<ErrorStackTrace errorObject={data?.error_object} />
			</Box>
		</Box>
	)
}

const Tags: React.FC<{ errorObject?: GetErrorObjectQuery['error_object'] }> = ({
	errorObject,
}) => {
	if (!errorObject) {
		return null
	}

	// TODO: Be smarter about how we pull these.
	const tags = [
		{ key: 'environment', label: errorObject?.environment },
		{ key: 'browser', label: errorObject?.browser },
		{ key: 'os', label: errorObject?.os },
		{ key: 'url', label: errorObject?.url },
		{ key: 'created_at', label: errorObject?.created_at },
	].filter((t) => Boolean(t.label))

	return (
		<Box>
			<Box bb="neutral" pb="20" my="12">
				<Text weight="bold" size="large">
					Tags
				</Text>
			</Box>

			{tags.map((tag) => {
				return (
					<Box key={tag.key} display="inline-flex" as="span" mr="8">
						<Badge label={tag.key} />
						<Badge label={tag.label as string} />
					</Box>
				)
			})}
		</Box>
	)
}

const User: React.FC<{
	errorObject?: GetErrorObjectQuery['error_object']
}> = ({ errorObject }) => {
	if (!errorObject?.session) {
		return null
	}

	const { session } = errorObject
	const displayName = getDisplayName(session as any)
	const avatarImage = getIdentifiedUserProfileImage(session as any)
	const location = [session?.city, session?.state, session?.country]
		.filter(Boolean)
		.join(', ')

	return (
		<div style={{ width: '100%' }}>
			<Text size="large" weight="bold">
				User details
			</Text>
			<Box border="neutral" borderRadius="6" mt="12">
				<Box
					bb="neutral"
					py="8"
					px="12"
					alignItems="center"
					display="flex"
					justifyContent="space-between"
				>
					<Box alignItems="center" display="flex">
						<Avatar
							seed={displayName}
							style={{ height: 28, width: 28 }}
							customImage={avatarImage}
						/>
						<Text>{displayName}</Text>
					</Box>
					<Button variant="grey" iconRight={<IconArrowsExpand />}>
						All sessions for this user
					</Button>
				</Box>

				<Box py="8" px="12">
					<table>
						<tr>
							<th>User-ID</th>
							<td>id1234</td>
						</tr>
						<tr>
							<th>Location</th>
							<td>{location}</td>
						</tr>
					</table>
				</Box>
			</Box>
		</div>
	)
}

export default ErrorInstance
