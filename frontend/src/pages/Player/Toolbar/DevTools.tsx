import DevToolsWindowV2 from '@pages/Player/Toolbar/DevToolsWindowV2/DevToolsWindowV2'
import React from 'react'

import { PlayerPageProductTourSelectors } from '../PlayerPageProductTour/PlayerPageProductTour'

interface Props {
	width: number
}

export const DevTools = ({ width }: Props) => {
	return (
		<div id={PlayerPageProductTourSelectors.DevToolsPanel}>
			<DevToolsWindowV2 width={width} />
		</div>
	)
}
