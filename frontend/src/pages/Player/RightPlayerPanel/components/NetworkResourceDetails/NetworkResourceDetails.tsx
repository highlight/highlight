import { PreviousNextGroup } from '@components/PreviousNextGroup/PreviousNextGroup'
import { Box, ButtonIcon, IconSolidX, Text } from '@highlight-run/ui'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { useResourcesContext } from '@pages/Player/ResourcesContext/ResourcesContext'
import { NetworkResource } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import analytics from '@util/analytics'
import React, { useMemo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

const NetworkResourceDetails = React.memo(
	({ resource }: { resource: NetworkResource }) => {
		const { setActiveNetworkResource } = usePlayerUIContext()
		const { resources } = useResourcesContext()
		const {
			sessionMetadata: { startTime },
		} = useReplayerContext()

		const networkResources = useMemo(() => {
			return (
				(resources.map((event) => ({
					...event,
					timestamp: event.startTime + startTime,
				})) as NetworkResource[]) ?? []
			)
		}, [resources, startTime])

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
					pb="8"
					display="flex"
					flexDirection="column"
					gap="8"
				>
					<Box
						style={{ height: 20 }}
						display="flex"
						alignItems="center"
					>
						<Text size="small" weight="medium" color="strong">
							Network request
						</Text>
					</Box>
				</Box>
			</Box>
		)
	},
)

export default NetworkResourceDetails
