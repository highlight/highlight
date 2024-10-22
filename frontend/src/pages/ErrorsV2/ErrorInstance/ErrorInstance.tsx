import { useApolloClient } from '@apollo/client'
import { useAuthContext } from '@authentication/AuthContext'
import { Avatar } from '@components/Avatar/Avatar'
import { Button } from '@components/Button'
import JsonViewer from '@components/JsonViewer/JsonViewer'
import LoadingBox from '@components/LoadingBox'
import {
	GetErrorInstanceDocument,
	useGetErrorInstanceLazyQuery,
} from '@graph/hooks'
import {
	ErrorObjectFragment,
	GetErrorGroupQuery,
	GetErrorInstanceQuery,
} from '@graph/operations'
import {
	Badge,
	Box,
	Callout,
	IconSolidCode,
	IconSolidCog,
	IconSolidExternalLink,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import ErrorStackTrace from '@pages/ErrorsV2/ErrorStackTrace/ErrorStackTrace'
import { GitHubEnhancementSettings } from '@pages/ErrorsV2/GitHubEnhancementSettings/GitHubEnhancementSettings'
import {
	getDisplayNameAndField,
	getIdentifiedUserProfileImage,
	getUserProperties,
} from '@pages/Sessions/SessionsFeedV3/MinimalSessionCard/utils/utils'
import analytics from '@util/analytics'
import { loadSession } from '@util/preload'
import { useParams } from '@util/react-router/useParams'
import { copyToClipboard } from '@util/string'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useSearchContext } from '@/components/Search/SearchContext'
import { useGetWorkspaceSettingsQuery } from '@/graph/generated/hooks'
import ErrorBodyText from '@/pages/ErrorsV2/ErrorBody/components/ErrorBodyText'
import { AiErrorSuggestion } from '@/pages/ErrorsV2/ErrorInstance/AiErrorSuggestion'
import { ErrorBoundaryFeedback } from '@/pages/ErrorsV2/ErrorInstance/ErrorBoundaryFeedback'
import { ErrorSessionMissingOrExcluded } from '@/pages/ErrorsV2/ErrorInstance/ErrorSessionMissingOrExcluded'
import { PreviousNextInstance } from '@/pages/ErrorsV2/ErrorInstance/PreviousNextInstance'
import { RelatedLogs } from '@/pages/ErrorsV2/ErrorInstance/RelatedLogs'
import { RelatedSession } from '@/pages/ErrorsV2/ErrorInstance/RelatedSession'
import { RelatedTrace } from '@/pages/ErrorsV2/ErrorInstance/RelatedTrace'
import { SeeAllInstances } from '@/pages/ErrorsV2/ErrorInstance/SeeAllInstances'
import { isSessionAvailable } from '@/pages/ErrorsV2/ErrorInstance/utils'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'

const MAX_USER_PROPERTIES = 4
type Props = React.PropsWithChildren & {
	errorGroup: GetErrorGroupQuery['error_group']
}

const METADATA_LABELS: { [key: string]: string } = {
	os: 'OS',
	url: 'URL',
	id: 'ID',
} as const

export const ErrorInstance: React.FC<Props> = ({ errorGroup }) => {
	const { error_object_id } = useParams<{ error_object_id: string }>()
	const client = useApolloClient()
	const { currentWorkspace } = useApplicationContext()
	const [displayGitHubSettings, setDisplayGitHubSettings] = useState(false)
	const { query, startDate, endDate } = useSearchContext()

	const { data: workspaceSettingsData } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: String(currentWorkspace?.id) },
		skip: !currentWorkspace?.id,
	})

	const [getErrorInstance, { error, data, loading, called }] =
		useGetErrorInstanceLazyQuery()

	useEffect(() => {
		getErrorInstance({
			variables: {
				error_group_secure_id: String(errorGroup?.secure_id),
				error_object_id,
				params: {
					query,
					date_range: {
						start_date: startDate!.toISOString(),
						end_date: endDate!.toISOString(),
					},
				},
			},
			onCompleted: (data) => {
				const previousErrorObjectId = data?.error_instance?.previous_id
				const nextErrorObjectId = data?.error_instance?.next_id

				// Prefetch the next/previous error objects so they are in the cache.
				// Using client directly because the lazy query had issues with canceling
				// multiple requests: https://github.com/apollographql/apollo-client/issues/9755
				if (previousErrorObjectId) {
					client.query({
						query: GetErrorInstanceDocument,
						variables: {
							error_group_secure_id: String(
								errorGroup?.secure_id,
							),
							error_object_id: previousErrorObjectId,
						},
					})
				}

				if (nextErrorObjectId) {
					client.query({
						query: GetErrorInstanceDocument,
						variables: {
							error_group_secure_id: String(
								errorGroup?.secure_id,
							),
							error_object_id: nextErrorObjectId,
						},
					})
				}

				// Prefetch session data.
				if (data?.error_instance?.error_object?.session) {
					loadSession(
						data.error_instance.error_object.session.secure_id,
					)
				}
			},
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [error_object_id, errorGroup?.secure_id])

	useEffect(
		() =>
			analytics.track('error_instance_view', {
				error_instance_id: error_object_id,
			}),
		[error_object_id],
	)

	if (!called || loading) {
		return (
			<Box mt="10">
				<LoadingBox />
			</Box>
		)
	}

	const errorInstance = data?.error_instance
	if (error || !errorInstance) {
		return (
			<Box m="auto" mt="10" style={{ maxWidth: 300 }}>
				<Callout title="Failed to load error instance" kind="error">
					<Box mb="6">
						<Text color="moderate">
							There was an error loading this error instance.
						</Text>
					</Box>
				</Callout>
			</Box>
		)
	}

	return (
		<Box id="error-instance-container">
			<Stack direction="row" my="12" alignItems="center">
				<Stack direction="row" flexGrow={1} alignItems="center">
					<SeeAllInstances data={data} />
					<PreviousNextInstance data={data} />
				</Stack>
				<Stack direction="row" gap="4" alignItems="center">
					<RelatedSession data={data} />
					<RelatedLogs data={data} />
					<RelatedTrace data={data} />
				</Stack>
			</Stack>

			<ErrorInstanceBody errorInstance={errorInstance} />

			{workspaceSettingsData?.workspaceSettings?.ai_application && (
				<Box display="flex" flexDirection="column" mb="40">
					<Stack direction="row" align="center" pb="8" gap="8">
						<Text size="large" weight="bold" color="strong">
							Harold AI
						</Text>
						<Badge label="Beta" size="medium" variant="purple" />
					</Stack>
					<AiErrorSuggestion
						errorObjectId={errorInstance.error_object.id}
					/>
				</Box>
			)}

			<ErrorInstanceInfo
				errorGroup={errorGroup}
				errorInstance={errorInstance}
			/>

			<ErrorInstanceStackTrace
				displayGitHubSettings={displayGitHubSettings}
				errorInstance={errorInstance}
				setDisplayGitHubSettings={setDisplayGitHubSettings}
			/>
		</Box>
	)
}

export const ErrorInstanceBody: React.FC<{
	errorInstance: GetErrorInstanceQuery['error_instance']
}> = ({ errorInstance }) => {
	if (!errorInstance) {
		return null
	}

	return (
		<Box py="12" px="16" mb="40" border="secondary" borderRadius="8">
			<Box mb="8" display="flex" gap="6" alignItems="center" color="weak">
				<IconSolidCode />
				<Text color="moderate">Instance Error Body</Text>
			</Box>
			<ErrorBodyText errorBody={errorInstance.error_object.event} />
		</Box>
	)
}

export const ErrorInstanceInfo: React.FC<{
	errorGroup: Props['errorGroup']
	errorInstance: GetErrorInstanceQuery['error_instance']
}> = ({ errorGroup, errorInstance }) => {
	if (!errorGroup || !errorInstance) {
		return null
	}

	return (
		<>
			<Box
				display="flex"
				flexDirection={{ mobile: 'column', desktop: 'row' }}
				mb="40"
				gap="40"
			>
				<div style={{ flexBasis: 0, flexGrow: 1 }}>
					<Metadata errorObject={errorInstance.error_object} />
				</div>

				<div style={{ flexBasis: 0, flexGrow: 1 }}>
					<User errorObject={errorInstance.error_object} />
				</div>
			</Box>

			{errorGroup?.type === 'console.error' &&
				errorGroup.event.length > 1 && (
					<>
						<Text size="large" weight="bold">
							Error event data
						</Text>

						<Box bt="secondary" my="12" py="16">
							<JsonViewer src={errorGroup.event} collapsed={1} />
						</Box>
					</>
				)}
		</>
	)
}

const Metadata: React.FC<{
	errorObject?: ErrorObjectFragment
}> = ({ errorObject }) => {
	if (!errorObject) {
		return null
	}

	let customProperties: any
	try {
		if (errorObject.payload) {
			customProperties = JSON.parse(errorObject.payload)
		}
	} catch (e) {}

	const metadata = [
		{ key: 'environment', label: errorObject?.environment },
		{ key: 'browser', label: errorObject?.browser },
		{ key: 'os', label: errorObject?.os },
		{ key: 'service', label: errorObject?.serviceName },
		{ key: 'version', label: errorObject?.serviceVersion },
		{ key: 'url', label: errorObject?.url },
		{ key: 'timestamp', label: errorObject?.timestamp },
		{
			key: 'Custom Properties',
			label: customProperties ? (
				<JsonViewer
					collapsed={true}
					src={customProperties}
					name="Custom Properties"
				/>
			) : undefined,
		},
	].filter((t) => Boolean(t.label))

	return (
		<Box>
			<Box bb="secondary" pb="12">
				<Text weight="bold" size="large" color="strong">
					Instance metadata
				</Text>
			</Box>

			<Box mt="12">
				{metadata.map((meta) => {
					const value =
						meta.key === 'timestamp'
							? moment(meta.label as string).format(
									'M/D/YY h:mm:ss.SSS A',
								)
							: meta.label
					return (
						<Box display="flex" gap="6" key={meta.key}>
							<Box
								py="6"
								cursor="pointer"
								onClick={() => copyToClipboard(meta.key)}
								style={{ width: '33%' }}
							>
								<Text
									color="weak"
									transform="capitalize"
									align="left"
									lines="1"
									size="xSmall"
								>
									{METADATA_LABELS[meta.key] ??
										meta.key.replace('_', ' ')}
								</Text>
							</Box>
							<Box style={{ width: '67%' }}>
								<Tag
									kind="secondary"
									emphasis="low"
									shape="basic"
									onClick={() => {
										if (typeof value === 'string') {
											value && copyToClipboard(value)
										}
									}}
									lines={
										typeof value === 'string'
											? '4'
											: undefined
									}
									title={String(value)}
									style={{ width: '100%' }}
									wordBreak="word"
								>
									{value}
								</Tag>
							</Box>
						</Box>
					)
				})}
			</Box>
		</Box>
	)
}

const User: React.FC<{
	errorObject?: ErrorObjectFragment
}> = ({ errorObject }) => {
	const navigate = useNavigate()
	const { projectId } = useProjectId()
	const { isLoggedIn } = useAuthContext()
	const [truncated, setTruncated] = useState(true)
	const [displayName, field] = getDisplayNameAndField(errorObject?.session)

	const searchQuery = useMemo(() => {
		if (errorObject?.session?.identifier && field !== null) {
			return `${field}=${displayName}`
		} else if (errorObject?.session?.fingerprint) {
			return `device_id=${errorObject?.session.fingerprint}`
		}

		return ''
	}, [
		displayName,
		errorObject?.session?.fingerprint,
		errorObject?.session?.identifier,
		field,
	])

	const userDetailsBox = (
		<Box pb="12">
			<Text weight="bold" size="large" color="strong">
				User details
			</Text>
		</Box>
	)

	if (!isSessionAvailable(errorObject)) {
		return (
			<Box width="full">
				{userDetailsBox}
				<ErrorSessionMissingOrExcluded errorObject={errorObject} />
			</Box>
		)
	}

	const userProperties = getUserProperties(
		errorObject?.session?.user_properties,
	)
	const avatarImage = getIdentifiedUserProfileImage(errorObject?.session)
	const userDisplayPropertyKeys = Object.keys(userProperties)
		.filter((k) => k !== 'avatar')
		.slice(
			0,
			truncated
				? MAX_USER_PROPERTIES - 1
				: Object.keys(userProperties).length,
		)

	const truncateable =
		Object.keys(userProperties).length > MAX_USER_PROPERTIES
	const location = [
		errorObject?.session?.city,
		errorObject?.session?.state,
		errorObject?.session?.country,
	]
		.filter(Boolean)
		.join(', ')

	return (
		<Box width="full">
			{userDetailsBox}
			<Box border="secondary" borderRadius="6">
				<Box
					bb="secondary"
					py="8"
					px="12"
					alignItems="center"
					display="flex"
					justifyContent="space-between"
					gap="4"
				>
					<Box alignItems="center" display="flex" gap="8">
						<Avatar
							seed={displayName}
							style={{ height: 28, width: 28 }}
							customImage={avatarImage}
						/>
						<Text lines="1">{displayName}</Text>
					</Box>

					<Box flexShrink={0} display="flex">
						<Button
							kind="secondary"
							emphasis="high"
							iconRight={<IconSolidExternalLink />}
							disabled={!isLoggedIn}
							onClick={() => {
								if (!isLoggedIn) {
									return
								}

								navigate({
									pathname: `/${projectId}/sessions`,
									search: `query=${searchQuery}`,
								})
							}}
							trackingId="error_all-sessions-for-user_click"
						>
							All sessions for this user
						</Button>
					</Box>
				</Box>

				<Box py="8" px="12">
					<Box display="flex" flexDirection="column">
						<Box gap="16">
							{userDisplayPropertyKeys.map((key) => (
								<Box display="flex" gap="6" key={key}>
									<Box
										py="8"
										overflow="hidden"
										onClick={() => copyToClipboard(key)}
										style={{ width: '33%' }}
									>
										<Text
											color="weak"
											align="left"
											transform="capitalize"
											lines="1"
											title={key}
											size="xSmall"
										>
											{METADATA_LABELS[key] ?? key}
										</Text>
									</Box>

									<Box
										py="2"
										display="flex"
										overflow="hidden"
										style={{ width: '67%' }}
									>
										<Tag
											onClick={() =>
												copyToClipboard(
													userProperties[key],
												)
											}
											title={userProperties[key]}
											kind="secondary"
											emphasis="low"
											shape="basic"
											style={{ width: '100%' }}
										>
											{userProperties[key]}
										</Tag>
									</Box>
								</Box>
							))}

							<Box display="flex" alignItems="center" gap="6">
								<Box py="8" style={{ width: '33%' }}>
									<Text
										color="weak"
										align="left"
										transform="capitalize"
										lines="1"
										size="xSmall"
									>
										Location
									</Text>
								</Box>

								<Box
									py="2"
									style={{ width: '67%' }}
									display="flex"
									overflow="hidden"
								>
									<Tag
										onClick={() =>
											copyToClipboard(location)
										}
										title={location}
										kind="secondary"
										emphasis="low"
										shape="basic"
										style={{ width: '100%' }}
									>
										{location}
									</Tag>
								</Box>
							</Box>
						</Box>
						{truncateable && (
							<Box mt="4" display="flex">
								<Tag
									onClick={() => setTruncated(!truncated)}
									kind="secondary"
									emphasis="medium"
									shape="basic"
								>
									Show {truncated ? 'more' : 'less'}
								</Tag>
							</Box>
						)}
					</Box>
				</Box>
				{errorObject && <ErrorBoundaryFeedback data={errorObject} />}
			</Box>
		</Box>
	)
}

export const ErrorInstanceStackTrace: React.FC<{
	displayGitHubSettings: boolean
	errorInstance: GetErrorInstanceQuery['error_instance']
	setDisplayGitHubSettings: (value: boolean) => void
}> = ({ displayGitHubSettings, errorInstance, setDisplayGitHubSettings }) => {
	if (!errorInstance) {
		return null
	}

	return (
		<>
			{(errorInstance.error_object.stack_trace !== '' &&
				errorInstance.error_object.stack_trace !== 'null') ||
			errorInstance.error_object.structured_stack_trace?.length ? (
				displayGitHubSettings ? (
					<GitHubEnhancementSettings
						onClose={() => setDisplayGitHubSettings(false)}
						errorObject={errorInstance.error_object}
					/>
				) : (
					<>
						<Stack
							direction="row"
							justifyContent="space-between"
							alignItems="center"
						>
							<Text size="large" weight="bold" color="strong">
								Stacktrace
							</Text>
							{errorInstance.error_object?.type === 'Backend' && (
								<Button
									kind="secondary"
									emphasis="medium"
									trackingId="errorInstanceGithubEnhancementSetup"
									iconLeft={<IconSolidCog size={12} />}
									onClick={() =>
										setDisplayGitHubSettings(true)
									}
								>
									Setup GitHub-enhanced stacktraces
								</Button>
							)}
						</Stack>
						<Box mt="12">
							<ErrorStackTrace
								errorObject={errorInstance.error_object}
							/>
						</Box>
					</>
				)
			) : null}
		</>
	)
}
