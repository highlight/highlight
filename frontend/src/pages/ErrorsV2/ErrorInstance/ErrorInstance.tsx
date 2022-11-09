import { Avatar } from '@components/Avatar/Avatar'
import {
	useGetErrorObjectQuery,
	useGetProjectQuery,
	useGetRecentErrorsQuery,
} from '@graph/hooks'
import { GetErrorGroupQuery, GetErrorObjectQuery } from '@graph/operations'
import {
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
	getDisplayNameAndField,
	getIdentifiedUserProfileImage,
	getUserProperties,
} from '@pages/Sessions/SessionsFeedV2/components/MinimalSessionCard/utils/utils'
import { useParams } from '@util/react-router/useParams'
import { useHistory } from 'react-router-dom'
import React from 'react'
import { Maybe, Session } from '@graph/schemas'
import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { FiExternalLink } from 'react-icons/fi'

type Props = React.PropsWithChildren & {
	errorGroup: GetErrorGroupQuery['error_group']
}

const ErrorInstance: React.FC<Props> = ({ errorGroup }) => {
	const { projectId } = useProjectId()
	const history = useHistory()
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
	const { data } = useGetErrorObjectQuery({
		variables: {
			id: String(metadataLog[selectedErrorObjectIndex]?.error_id),
		},
	})

	if (!data?.error_object) {
		return null
	}

	const errorObject = data.error_object
	const projectPrefix = getProjectPrefix(projectData?.project)

	return (
		<Box>
			<Box mt="28" mb="32" display="flex" justifyContent="space-between">
				<Box display="flex" flexDirection="column" gap="16">
					<Heading level="h4">Error Instance</Heading>

					<Text>
						Error groups {'>'} {projectPrefix}-
						{errorObject.error_group_id} {' > '}
						{projectPrefix}-Ins-{errorObject.id}
					</Text>
				</Box>

				<Box display="flex" gap="8">
					<Button
						disabled={selectedErrorObjectIndex <= 0}
						variant="white"
						onClick={() =>
							setSelectedErrorObjectIndex(
								Math.max(selectedErrorObjectIndex - 1, 0),
							)
						}
					>
						Older
					</Button>
					<Button
						disabled={
							selectedErrorObjectIndex >= metadataLog.length - 1
						}
						variant="white"
						onClick={() =>
							setSelectedErrorObjectIndex(
								selectedErrorObjectIndex + 1,
							)
						}
					>
						Newer
					</Button>
					{/* TODO: Build link component that looks like a button, or use history to navigate */}
					<Button
						variant="grey"
						onClick={() =>
							history.push(
								`/${projectId}/sessions/${errorObject.session?.secure_id}`,
							)
						}
						iconLeft={<IconPlay />}
					>
						Show Session
					</Button>
				</Box>
			</Box>

			<Box
				display="flex"
				flexDirection={{ desktop: 'row', mobile: 'column' }}
				my="40"
				gap="40"
			>
				<div style={{ flexBasis: 0, flexGrow: 1 }}>
					<Metadata errorObject={errorObject} />
				</div>

				<div style={{ flexBasis: 0, flexGrow: 1 }}>
					<Box display="flex">
						<User errorObject={errorObject} />
					</Box>
				</div>
			</Box>

			<Text size="large" weight="bold">
				Stack trace
			</Text>
			<Box bt="neutral" mt="12" pt="16">
				<ErrorStackTrace errorObject={errorObject} />
			</Box>
		</Box>
	)
}

const Metadata: React.FC<{
	errorObject?: GetErrorObjectQuery['error_object']
}> = ({ errorObject }) => {
	if (!errorObject) {
		return null
	}

	// TODO: Be smarter about how we pull these.
	const metadata = [
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
					Instance metadata
				</Text>
			</Box>

			<Box as="table">
				{metadata.map((tag) => {
					return (
						<Box as="tr">
							<Box as="th" py="10" pr="16">
								<Text
									color="neutral500"
									transform="capitalize"
									align="left"
								>
									{tag.key}
								</Text>
							</Box>
							<Box as="td">
								<Text align="left">{tag.label}</Text>
							</Box>
						</Box>
					)
				})}
			</Box>
		</Box>
	)
}

const User: React.FC<{
	errorObject?: GetErrorObjectQuery['error_object']
}> = ({ errorObject }) => {
	const history = useHistory()
	const { projectId } = useProjectId()
	const { setSearchParams } = useSearchContext()

	if (!errorObject?.session) {
		return null
	}

	const { session } = errorObject
	const userProperties = getUserProperties(session)
	const [displayName, field] = getDisplayNameAndField(session)
	const avatarImage = getIdentifiedUserProfileImage(session)
	const location = [session?.city, session?.state, session?.country]
		.filter(Boolean)
		.join(', ')

	return (
		<Box width="full">
			<Box pb="20" mt="12">
				<Text weight="bold" size="large">
					User details
				</Text>
			</Box>
			<Box border="neutral" borderRadius="6">
				<Box
					bb="neutral"
					py="8"
					px="12"
					alignItems="center"
					display="flex"
					justifyContent="space-between"
				>
					<Box alignItems="center" display="flex" gap="8">
						<Avatar
							seed={displayName}
							style={{ height: 28, width: 28 }}
							customImage={avatarImage}
						/>
						<Text>{session.identifier}</Text>
					</Box>

					<Button
						variant="grey"
						iconRight={<FiExternalLink />}
						onClick={() => {
							// Logic taken from Metadata box. There may be a cleaner way.
							const searchParams = {
								...EmptySessionsSearchParams,
							}

							if (session.identifier && field !== null) {
								searchParams.user_properties = [
									{
										id: '0',
										name: field,
										value: displayName,
									},
								]
							} else if (session?.fingerprint) {
								searchParams.device_id = String(
									session.fingerprint,
								)
							}

							history.push(`/${projectId}/sessions`)
							setSearchParams(searchParams)
						}}
					>
						All sessions for this user
					</Button>
				</Box>

				<Box py="8" px="12">
					<Box as="table">
						{Object.keys(userProperties)
							.filter((k) => k !== 'avatar')
							.map((key) => (
								<Box as="tr" key={key}>
									<Box as="th" py="10" pr="16">
										<Text
											color="neutral500"
											align="left"
											transform="capitalize"
										>
											{key}
										</Text>
									</Box>
									<Box as="td">{userProperties[key]}</Box>
								</Box>
							))}

						<Box as="tr">
							<Box as="th" py="10" pr="16">
								<Text color="neutral500" align="left">
									Location
								</Text>
							</Box>
							<Box as="td">{location}</Box>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	)
}

export default ErrorInstance
