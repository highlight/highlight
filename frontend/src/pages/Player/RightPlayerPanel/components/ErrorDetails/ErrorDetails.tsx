import { useAuthContext } from '@authentication/AuthContext'
import { Button } from '@components/Button'
import LoadingBox from '@components/LoadingBox'
import { PreviousNextGroup } from '@components/PreviousNextGroup/PreviousNextGroup'
import {
	GetErrorGroupDocument,
	useGetErrorGroupQuery,
	useGetProjectQuery,
} from '@graph/hooks'
import { ErrorObject } from '@graph/schemas'
import {
	Box,
	ButtonIcon,
	Callout,
	IconSolidArrowCircleRight,
	IconSolidCode,
	IconSolidExternalLink,
	IconSolidLocationMarker,
	IconSolidUsers,
	IconSolidViewGrid,
	IconSolidX,
	Tag,
	Text,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import AffectedUserCount from '@pages/ErrorsV2/ErrorBody/components/AffectedUserCount'
import ErrorBodyText from '@pages/ErrorsV2/ErrorBody/components/ErrorBodyText'
import ErrorFrequencyChart from '@pages/ErrorsV2/ErrorBody/components/ErrorFrequencyChart'
import ErrorObjectCount from '@pages/ErrorsV2/ErrorBody/components/ErrorObjectCount'
import ErrorOccurenceDate from '@pages/ErrorsV2/ErrorBody/components/ErrorOccurenceDate'
import { getHeaderFromError } from '@pages/ErrorsV2/utils'
import { getProjectPrefix } from '@pages/ErrorsV2/utils'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import analytics from '@util/analytics'
import { getErrorBody } from '@util/errors/errorUtils'
import { client } from '@util/graph'
import React, { useMemo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useHistory } from 'react-router-dom'

interface Props {
	error: ErrorObject
}

const ErrorDetails = React.memo(({ error }: Props) => {
	const { errors, setTime, sessionMetadata } = useReplayerContext()
	const { setActiveError } = usePlayerUIContext()
	const { isLoggedIn } = useAuthContext()

	const eventIdx = errors.findIndex((e) => e.id === error.id)
	const [prev, next] = [eventIdx - 1, eventIdx + 1]

	const canMoveBackward = !!errors[prev]
	const canMoveForward = !!errors[next]

	const secureId = error.error_group_secure_id
	const {
		data,
		loading,
		error: errorQueryingErrorGroup,
	} = useGetErrorGroupQuery({
		variables: { secure_id: secureId },
		skip: !secureId,
		onCompleted: () => {
			analytics.track('Viewed error', { is_guest: !isLoggedIn })
			if (canMoveBackward) {
				client.query({
					query: GetErrorGroupDocument,
					variables: {
						secure_id: String(errors[prev].error_group_secure_id),
					},
				})
			}

			if (canMoveForward) {
				client.query({
					query: GetErrorGroupDocument,
					variables: {
						secure_id: String(errors[next].error_group_secure_id),
					},
				})
			}
		},
	})

	const errorGroup = data?.error_group
	const event = error?.event ?? errorGroup?.event
	const headerText = useMemo(() => {
		let header = getHeaderFromError(event ?? [])
		if (header && event) {
			const title = getErrorBody(event)
			if (title) {
				header = title
			}
		}
		return header
	}, [event])

	const { data: projectData } = useGetProjectQuery({
		variables: { id: String(errorGroup?.project_id) },
		skip: !errorGroup,
	})

	useHotkeys(
		'h',
		() => {
			if (canMoveBackward) {
				analytics.track('PrevErrorKeyboardShortcut')
				setActiveError(errors[prev])
			}
		},
		[canMoveBackward, prev],
	)

	useHotkeys(
		'l',
		() => {
			if (canMoveForward) {
				analytics.track('NextErrorKeyboardShortcut')
				setActiveError(errors[next])
			}
		},
		[canMoveForward, next],
	)

	const history = useHistory()
	const { projectId } = useProjectId()

	if (errorQueryingErrorGroup) {
		return (
			<Box m="auto" style={{ maxWidth: 300 }}>
				<Callout kind="info" title="Can't load error">
					<Box pb="6">
						<Text>
							This error does not exist or has not been made
							public.
						</Text>
					</Box>
				</Callout>
			</Box>
		)
	}

	if (loading) {
		return <LoadingBox />
	}

	return (
		<Box pl="12" pr="8" height="full" display="flex" flexDirection="column">
			<Box py="6" display="flex" alignItems="center">
				<Box display="flex" gap="6" alignItems="center">
					<PreviousNextGroup
						onPrev={() => {
							setActiveError(errors[prev])
						}}
						prevShortcut="h"
						onNext={() => {
							setActiveError(errors[next])
						}}
						nextShortcut="l"
						canMoveBackward={canMoveBackward}
						canMoveForward={canMoveForward}
					/>
					<Text size="xSmall" weight="medium" color="weak">
						{eventIdx + 1} / {errors.length}
					</Text>
				</Box>
				<Box ml="auto" display="flex" alignItems="center">
					<ButtonIcon
						kind="secondary"
						size="small"
						shape="square"
						emphasis="low"
						icon={<IconSolidX />}
						onClick={() => {
							setActiveError(undefined)
						}}
					/>
				</Box>
			</Box>
			<Box py="8" display="flex" flexDirection="column" gap="8">
				<Text size="small" weight="medium" color="strong">
					{headerText}
				</Text>
				<Box display="flex" alignItems="center">
					<Tag
						iconLeft={<IconSolidLocationMarker />}
						kind="secondary"
						size="medium"
						shape="basic"
						lines="1"
					>
						{errorGroup?.type}
					</Tag>
					<Button
						trackingId="GoToErrorGroup"
						kind="secondary"
						size="small"
						emphasis="low"
						iconRight={<IconSolidArrowCircleRight />}
						onClick={() => {
							setTime(
								new Date(error.timestamp).getTime() -
									sessionMetadata.startTime,
							)
						}}
						style={{
							marginLeft: 'auto',
						}}
					>
						Go to error
					</Button>
				</Box>
			</Box>
			<Box py="8" display="flex" flexDirection="column">
				<Box border="dividerWeak" borderRadius="6">
					<Stat
						title={
							<>
								<IconSolidUsers />
								<Text color="moderate">Affected users</Text>
							</>
						}
					>
						<AffectedUserCount errorGroup={errorGroup} />
					</Stat>

					<Stat
						title={
							<>
								<IconSolidViewGrid />
								<Text color="moderate">Instances</Text>
							</>
						}
					>
						<ErrorObjectCount errorGroup={errorGroup} />
					</Stat>

					<Stat
						title={
							<Text color="moderate">Last/first occurrence</Text>
						}
					>
						<ErrorOccurenceDate errorGroup={errorGroup} />
					</Stat>

					<Stat title={<Text color="moderate">Last 30 days</Text>}>
						<ErrorFrequencyChart errorGroup={errorGroup} />
					</Stat>

					<Box
						display="flex"
						flexDirection="column"
						gap="8"
						py="8"
						pl="12"
						pr="8"
					>
						<Box
							color="weak"
							display="flex"
							alignItems="center"
							gap="4"
						>
							<IconSolidCode />
							<Text color="moderate">Error Body</Text>
						</Box>
						<ErrorBodyText errorGroup={errorGroup} />
					</Box>
				</Box>
			</Box>
			<Box mt="auto" py="8" display="flex" flexDirection="column">
				<Button
					kind="secondary"
					trackingId="ViewErrorGroup"
					size="small"
					emphasis="high"
					iconRight={<IconSolidExternalLink />}
					onClick={() => {
						history.push(
							`/${projectId}/errors/${error.error_group_secure_id}`,
						)
					}}
				>
					View {getProjectPrefix(projectData?.project)}-
					{errorGroup?.id}
				</Button>
			</Box>
		</Box>
	)
})

const Stat: React.FC<
	React.PropsWithChildren<{ title: React.ReactElement; noBorder?: boolean }>
> = ({ title, children }) => (
	<Box
		display="flex"
		flexDirection="column"
		gap="6"
		py="8"
		pl="12"
		pr="8"
		bb="dividerWeak"
	>
		<Box color="weak" display="flex" alignItems="center" gap="4">
			{title}
		</Box>
		<Box display="flex" alignItems="center" style={{ height: 24 }}>
			{children}
		</Box>
	</Box>
)

export default ErrorDetails
