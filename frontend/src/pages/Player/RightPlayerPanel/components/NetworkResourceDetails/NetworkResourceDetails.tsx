import { PreviousNextGroup } from '@components/PreviousNextGroup/PreviousNextGroup'
import {
	Badge,
	Box,
	ButtonIcon,
	IconSolidArrowCircleRight,
	IconSolidX,
	Tag,
	Text,
} from '@highlight-run/ui'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { useResourcesContext } from '@pages/Player/ResourcesContext/ResourcesContext'
import { NetworkResource } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import analytics from '@util/analytics'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { MillisToMinutesAndSeconds } from '@util/time'
import React, { useMemo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

const NetworkResourceDetails = React.memo(
	({ resource }: { resource: NetworkResource }) => {
		const { setActiveNetworkResource } = usePlayerUIContext()
		const { resources } = useResourcesContext()
		const {
			sessionMetadata: { startTime },
			setTime,
		} = useReplayerContext()

		const networkResources = useMemo(() => {
			return (
				(resources.map((event) => ({
					...event,
					timestamp: event.startTime,
				})) as NetworkResource[]) ?? []
			)
		}, [resources])

		const resourceIdx = resources.findIndex((r) => resource.id === r.id)
		const [prev, next] = [resourceIdx - 1, resourceIdx + 1]
		const canMoveBackward = !!resources[prev]
		const canMoveForward = !!resources[next]

		useHotkeys(
			'h',
			() => {
				if (canMoveBackward) {
					analytics.track('PrevNetworkResourceKeyboardShortcut')
					setActiveNetworkResource(networkResources[prev])
				}
			},
			[canMoveBackward, prev],
		)

		useHotkeys(
			'l',
			() => {
				if (canMoveForward) {
					analytics.track('NextNetworkResourceKeyboardShortcut')
					setActiveNetworkResource(networkResources[next])
				}
			},
			[canMoveForward, next],
		)

		const { showPlayerAbsoluteTime } = usePlayerConfiguration()

		return (
			<Box display="flex" flexDirection="column">
				<Box pl="12" pr="8" py="6" display="flex">
					<Box display="flex" gap="6" alignItems="center">
						<PreviousNextGroup
							onPrev={() =>
								setActiveNetworkResource(networkResources[prev])
							}
							canMoveBackward={canMoveBackward}
							prevShortcut="h"
							onNext={() =>
								setActiveNetworkResource(networkResources[next])
							}
							canMoveForward={canMoveForward}
							nextShortcut="l"
						/>
						<Text size="xSmall" weight="medium" color="weak">
							{resourceIdx + 1} / {networkResources.length}
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
								setActiveNetworkResource(undefined)
							}}
						/>
					</Box>
				</Box>
				<Box
					px="12"
					py="8"
					display="flex"
					flexDirection="column"
					gap="8"
				>
					<Text
						size="small"
						weight="medium"
						color="strong"
						wrap="breakWord"
					>
						{resource.displayName ?? resource.name}
					</Text>
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
					>
						<Badge
							label={String(
								showPlayerAbsoluteTime
									? playerTimeToSessionAbsoluteTime({
											sessionStartTime: startTime,
											relativeTime:
												resource.timestamp as number,
									  })
									: MillisToMinutesAndSeconds(
											resource.timestamp as number,
									  ),
							)}
							size="small"
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
								setTime(
									new Date(resource.timestamp).getTime() -
										startTime,
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
			</Box>
		)
	},
)

export default NetworkResourceDetails
