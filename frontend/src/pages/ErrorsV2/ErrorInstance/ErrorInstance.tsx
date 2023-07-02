import { useApolloClient } from '@apollo/client'
import { useAuthContext } from '@authentication/AuthContext'
import { Avatar } from '@components/Avatar/Avatar'
import { Button } from '@components/Button'
import JsonViewer from '@components/JsonViewer/JsonViewer'
import LoadingBox from '@components/LoadingBox'
import { Skeleton } from '@components/Skeleton/Skeleton'
import {
	GetErrorInstanceDocument,
	useGetErrorInstanceQuery,
} from '@graph/hooks'
import { ErrorObjectFragment, GetErrorGroupQuery } from '@graph/operations'
import {
	Box,
	IconSolidCode,
	IconSolidExternalLink,
	Stack,
	Text,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import ErrorStackTrace from '@pages/ErrorsV2/ErrorStackTrace/ErrorStackTrace'
import {
	getDisplayNameAndField,
	getIdentifiedUserProfileImage,
	getUserProperties,
} from '@pages/Sessions/SessionsFeedV3/MinimalSessionCard/utils/utils'
import analytics from '@util/analytics'
import { loadSession } from '@util/preload'
import { useParams } from '@util/react-router/useParams'
import { copyToClipboard } from '@util/string'
import { buildQueryURLString } from '@util/url/params'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ErrorBodyText from '@/pages/ErrorsV2/ErrorBody/components/ErrorBodyText'
import { ErrorSessionMissingOrExcluded } from '@/pages/ErrorsV2/ErrorInstance/ErrorSessionMissingOrExcluded'
import { PreviousNextInstance } from '@/pages/ErrorsV2/ErrorInstance/PreviousNextInstance'
import { RelatedLogs } from '@/pages/ErrorsV2/ErrorInstance/RelatedLogs'
import { RelatedSession } from '@/pages/ErrorsV2/ErrorInstance/RelatedSession'
import { isSessionAvailable } from '@/pages/ErrorsV2/ErrorInstance/utils'

const MAX_USER_PROPERTIES = 4
type Props = React.PropsWithChildren & {
	errorGroup: GetErrorGroupQuery['error_group']
}

const METADATA_LABELS: { [key: string]: string } = {
	os: 'OS',
	url: 'URL',
	id: 'ID',
} as const

const ErrorInstance: React.FC<Props> = ({ errorGroup }) => {
	const { error_object_id } = useParams<{
		error_object_id: string
	}>()
	const client = useApolloClient()

	const { loading, data } = useGetErrorInstanceQuery({
		variables: {
			error_group_secure_id: String(errorGroup?.secure_id),
			error_object_id,
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
						error_group_secure_id: String(errorGroup?.secure_id),
						error_object_id: previousErrorObjectId,
					},
				})
			}

			if (nextErrorObjectId) {
				client.query({
					query: GetErrorInstanceDocument,
					variables: {
						error_group_secure_id: String(errorGroup?.secure_id),
						error_object_id: nextErrorObjectId,
					},
				})
			}

			// Prefetch session data.
			if (data?.error_instance?.error_object?.session) {
				loadSession(data.error_instance.error_object.session.secure_id)
			}
		},
	})

	const errorInstance = data?.error_instance

	useEffect(() => analytics.page(), [])

	if (!errorInstance || !errorInstance?.error_object) {
		if (!loading) return null

		return (
			<Box id="error-instance-container">
				<Stack direction="row" my="12">
					<Box flexGrow={1}>
						<PreviousNextInstance data={data} />
					</Box>
					<Stack direction="row" gap="4">
						<RelatedSession data={data} />
						<RelatedLogs data={data} />
					</Stack>
				</Stack>

				<Box display="flex" flexDirection="row" mb="40" gap="40">
					<div style={{ flexBasis: 0, flexGrow: 1 }}>
						<Box>
							<Box bb="secondary" pb="20" my="12">
								<Text weight="bold" size="large">
									Instance metadata
								</Text>
							</Box>
							<LoadingBox height={128} />
						</Box>
					</div>

					<div style={{ flexBasis: 0, flexGrow: 1 }}>
						<Box width="full">
							<Box pb="20" mt="12">
								<Text weight="bold" size="large">
									User details
								</Text>
							</Box>
							<LoadingBox height={128} />
						</Box>
					</div>
				</Box>

				<Text size="large" weight="bold">
					Stack trace
				</Text>
				<Box bt="secondary" mt="12" pt="16">
					<Skeleton count={10} />
				</Box>
			</Box>
		)
	}

	return (
		<Box id="error-instance-container">
			<Stack direction="row" my="12">
				<Box flexGrow={1}>
					<PreviousNextInstance data={data} />
				</Box>
				<Stack direction="row" gap="4">
					<RelatedSession data={data} />
					<RelatedLogs data={data} />
				</Stack>
			</Stack>

			<Box py="16" px="16" mb="40" border="secondary" borderRadius="8">
				<Box
					mb="20"
					display="flex"
					gap="6"
					alignItems="center"
					color="weak"
				>
					<IconSolidCode />
					<Text color="moderate">Instance Error Body</Text>
				</Box>
				<ErrorBodyText errorBody={errorInstance.error_object.event} />
			</Box>

			<Box display="flex" flexDirection="column" mb="40" gap="40">
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

			{(errorInstance.error_object.stack_trace !== '' &&
				errorInstance.error_object.stack_trace !== 'null') ||
			errorInstance.error_object.structured_stack_trace?.length ? (
				<>
					<Text size="large" weight="bold">
						Stack trace
					</Text>
					<Box bt="secondary" mt="12" pt="16">
						<ErrorStackTrace
							errorObject={errorInstance.error_object}
						/>
					</Box>
				</>
			) : null}
		</Box>
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
			<Box bb="secondary" pb="20" my="12">
				<Text weight="bold" size="large">
					Instance metadata
				</Text>
			</Box>

			<Box>
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
								py="10"
								cursor="pointer"
								onClick={() => copyToClipboard(meta.key)}
								style={{ width: '33%' }}
							>
								<Text
									color="n11"
									transform="capitalize"
									align="left"
									lines="1"
								>
									{METADATA_LABELS[meta.key] ??
										meta.key.replace('_', ' ')}
								</Text>
							</Box>
							<Box
								cursor="pointer"
								py="10"
								onClick={() => {
									if (typeof value === 'string') {
										value && copyToClipboard(value)
									}
								}}
								style={{ width: '67%' }}
							>
								<Text
									align="left"
									break="word"
									lines={
										typeof value === 'string'
											? '4'
											: undefined
									}
									title={String(value)}
								>
									{value}
								</Text>
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

	const userDetailsBox = (
		<Box pb="20" mt="12">
			<Text weight="bold" size="large">
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
	const [displayName, field] = getDisplayNameAndField(errorObject?.session)
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

								const searchParams: any = {}
								if (
									errorObject?.session?.identifier &&
									field !== null
								) {
									searchParams[`user_${field}`] = displayName
								} else if (errorObject?.session?.fingerprint) {
									searchParams.device_id = String(
										errorObject?.session.fingerprint,
									)
								}

								navigate({
									pathname: `/${projectId}/sessions`,
									search: buildQueryURLString(searchParams),
								})
							}}
							trackingId="errorInstanceAllSessionsForuser"
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
										py="10"
										overflow="hidden"
										onClick={() => copyToClipboard(key)}
										style={{ width: '33%' }}
									>
										<Text
											color="n11"
											align="left"
											transform="capitalize"
											lines="1"
											title={key}
										>
											{METADATA_LABELS[key] ?? key}
										</Text>
									</Box>

									<Box
										py="10"
										display="flex"
										overflow="hidden"
										onClick={() =>
											copyToClipboard(userProperties[key])
										}
										title={userProperties[key]}
										style={{ width: '67%' }}
									>
										<Text lines="1" as="span">
											{userProperties[key]}
										</Text>
									</Box>
								</Box>
							))}

							<Box display="flex" alignItems="center" gap="6">
								<Box py="10" style={{ width: '33%' }}>
									<Text color="n11" align="left">
										Location
									</Text>
								</Box>

								<Box py="10" style={{ width: '67%' }}>
									<Text>{location}</Text>
								</Box>
							</Box>
						</Box>
						{truncateable && (
							<Box>
								<Button
									onClick={() => setTruncated(!truncated)}
									kind="secondary"
									emphasis="medium"
									size="xSmall"
									trackingId="errorInstanceToggleProperties"
								>
									Show {truncated ? 'more' : 'less'}
								</Button>
							</Box>
						)}
					</Box>
				</Box>
			</Box>
		</Box>
	)
}

export default ErrorInstance
