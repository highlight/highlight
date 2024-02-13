import { Button } from '@components/Button'
import JsonViewer from '@components/JsonViewer/JsonViewer'
import LoadingBox from '@components/LoadingBox'
import { PreviousNextGroup } from '@components/PreviousNextGroup/PreviousNextGroup'
import { GetErrorGroupDocument, useGetErrorGroupQuery } from '@graph/hooks'
import { ErrorObject } from '@graph/schemas'
import {
	Badge,
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
	Tooltip,
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import AffectedUserCount from '@pages/ErrorsV2/ErrorBody/components/AffectedUserCount'
import ErrorBodyText from '@pages/ErrorsV2/ErrorBody/components/ErrorBodyText'
import ErrorFrequencyChart from '@pages/ErrorsV2/ErrorBody/components/ErrorFrequencyChart'
import ErrorObjectCount from '@pages/ErrorsV2/ErrorBody/components/ErrorObjectCount'
import ErrorOccurenceDate from '@pages/ErrorsV2/ErrorBody/components/ErrorOccurenceDate'
import { getHeaderFromError } from '@pages/ErrorsV2/utils'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import analytics from '@util/analytics'
import { getErrorBody } from '@util/errors/errorUtils'
import { client } from '@util/graph'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { parseOptionalJSON } from '@util/string'
import { MillisToMinutesAndSeconds } from '@util/time'
import { message } from 'antd'
import React, { useMemo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'

interface Props {
	error: ErrorObject
}

const ErrorDetails = React.memo(({ error }: Props) => {
	const {
		errors,
		setTime,
		sessionMetadata: { startTime },
	} = useReplayerContext()
	const { setActiveError } = usePlayerUIContext()

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
		variables: { secure_id: secureId, use_clickhouse: true },
		skip: !secureId,
		onCompleted: () => {
			analytics.track('session_view-error')

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

	const { showPlayerAbsoluteTime, setShowLeftPanel } =
		usePlayerConfiguration()

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

	const navigate = useNavigate()
	const { projectId } = useProjectId()

	const context = useMemo(() => {
		const data = parseOptionalJSON(error.payload || '')
		return data === 'null' ? '' : data
	}, [error.payload])

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

	const timestamp = new Date(error.timestamp).getTime() - startTime
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
				<Text size="small" weight="medium" color="strong" lines="4">
					{headerText}
				</Text>
				<Box display="flex" alignItems="center" gap="4">
					<Tooltip
						trigger={
							<Tag
								iconLeft={<IconSolidLocationMarker />}
								kind="secondary"
								size="medium"
								shape="basic"
								lines="1"
							>
								{errorGroup?.type}
							</Tag>
						}
					>
						<Text family="monospace">{errorGroup?.type}</Text>
					</Tooltip>
					<Badge
						label={String(
							showPlayerAbsoluteTime
								? playerTimeToSessionAbsoluteTime({
										sessionStartTime: startTime,
										relativeTime: timestamp,
								  })
								: MillisToMinutesAndSeconds(timestamp),
						)}
						size="medium"
						shape="basic"
						variant="gray"
						flexShrink={0}
					/>
					<Tag
						shape="basic"
						kind="secondary"
						size="medium"
						emphasis="low"
						iconRight={<IconSolidArrowCircleRight />}
						onClick={() => {
							setTime(timestamp)
							message.success(
								`Changed player time to ${MillisToMinutesAndSeconds(
									timestamp,
								)}`,
							)
						}}
						style={{
							marginLeft: 'auto',
							flexShrink: 0,
						}}
					>
						Go to error
					</Tag>
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
						height={24}
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
						height={24}
					>
						<ErrorObjectCount errorGroup={errorGroup} />
					</Stat>

					<Stat
						title={
							<Text color="moderate">Last/first occurrence</Text>
						}
						height={24}
					>
						<ErrorOccurenceDate errorGroup={errorGroup} />
					</Stat>

					<Stat
						title={<Text color="moderate">Last 30 days</Text>}
						height={24}
					>
						<ErrorFrequencyChart errorGroup={errorGroup} />
					</Stat>

					<Stat
						title={
							<>
								<IconSolidCode />
								<Text color="moderate">Error Body</Text>
							</>
						}
					>
						<ErrorBodyText errorBody={event} />
					</Stat>
					{context ? (
						<Stat
							title={<Text color="moderate">Error Context</Text>}
						>
							<JsonViewer
								src={context}
								collapsed
								style={{ fontSize: 11 }}
							/>
						</Stat>
					) : null}
				</Box>
			</Box>
			<Box mt="auto" py="8" display="flex" flexDirection="column">
				<Button
					kind="primary"
					trackingId="session_view-error-group"
					size="small"
					emphasis="high"
					iconRight={<IconSolidExternalLink />}
					onClick={() => {
						navigate(
							`/${projectId}/errors/${error.error_group_secure_id}`,
						)
						setShowLeftPanel(false)
					}}
				>
					View error group
				</Button>
			</Box>
		</Box>
	)
})

const Stat: React.FC<
	React.PropsWithChildren<{
		title: React.ReactElement
		noBorder?: boolean
		height?: number
	}>
> = ({ title, children, noBorder, height }) => (
	<Box
		display="flex"
		flexDirection="column"
		gap="6"
		py="8"
		pl="12"
		pr="8"
		bb={noBorder ? undefined : 'dividerWeak'}
	>
		<Box color="weak" display="flex" alignItems="center" gap="4">
			{title}
		</Box>
		<Box display="flex" alignItems="center" style={{ height }}>
			{children}
		</Box>
	</Box>
)

export default ErrorDetails
