import DevToolsWindowV2 from '@pages/Player/Toolbar/DevToolsWindowV2/DevToolsWindowV2'
import React from 'react'

import { PlayerPageProductTourSelectors } from '../PlayerPageProductTour/PlayerPageProductTour'
import { useReplayerContext } from '../ReplayerContext'

interface Props {
	width: number
}

export const DevTools = ({ width }: Props) => {
	const { isLiveMode } = useReplayerContext()

	return (
		<>
			{!isLiveMode && (
				<div id={PlayerPageProductTourSelectors.DevToolsPanel}>
					<DevToolsWindowV2 width={width} />
				</div>
			)}
		</>
	)
}
