import { useAuthContext } from '@authentication/AuthContext'
import useFeatureFlag, { Feature } from '@hooks/useFeatureFlag/useFeatureFlag'
import DevToolsWindowV2 from '@pages/Player/Toolbar/DevToolsWindowV2/DevToolsWindowV2'
import { useLocalStorage } from '@rehooks/local-storage'
import React from 'react'

import { PlayerPageProductTourSelectors } from '../PlayerPageProductTour/PlayerPageProductTour'
import { useReplayerContext } from '../ReplayerContext'
import { DevToolsWindow } from './DevToolsWindow/DevToolsWindow'

interface Props {
	width: number
}

export const DevTools = ({ width }: Props) => {
	const { isHighlightAdmin } = useAuthContext()
	const { time, isLiveMode, sessionMetadata } = useReplayerContext()

	const [devtoolsV2Override] = useLocalStorage(
		`highlight-devtools-v2`,
		isHighlightAdmin,
	)
	const devtoolsV2 = useFeatureFlag(
		Feature.SessionPlayerV2,
		isHighlightAdmin ? devtoolsV2Override : undefined,
	)

	return (
		<>
			{!isLiveMode && (
				<div id={PlayerPageProductTourSelectors.DevToolsPanel}>
					{devtoolsV2 ? (
						<DevToolsWindowV2 width={width} />
					) : (
						<DevToolsWindow
							time={(sessionMetadata.startTime ?? 0) + time}
							startTime={sessionMetadata.startTime ?? 0}
							width={width}
						/>
					)}
				</div>
			)}
		</>
	)
}
