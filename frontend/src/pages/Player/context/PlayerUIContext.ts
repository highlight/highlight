import { ErrorObject } from '@graph/schemas'
import { HighlightEvent } from '@pages/Player/HighlightEvent'
import { NetworkResource } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { createContext } from '@util/context/context'
import React from 'react'

export enum RightPanelView {
	Error = 'ERROR',
	NetworkResource = 'NETWORK_RESOURCE',
	Session = 'SESSION',
	Event = 'EVENT',
}

export type RightPlayerTab = 'Events' | 'Threads' | 'Metadata'
interface PlayerUIContext {
	isPlayerFullscreen: boolean
	setIsPlayerFullscreen: React.Dispatch<React.SetStateAction<boolean>>
	playerCenterPanelRef: React.RefObject<HTMLDivElement>
	/** Used to show detailed information. */
	selectedRightPanelTab: RightPlayerTab
	setSelectedRightPanelTab: (newValue: RightPlayerTab) => void

	activeEvent?: HighlightEvent
	setActiveEvent: React.Dispatch<
		React.SetStateAction<HighlightEvent | undefined>
	>
	rightPanelView: RightPanelView
	setRightPanelView: React.Dispatch<React.SetStateAction<RightPanelView>>

	activeError?: ErrorObject
	setActiveError: React.Dispatch<
		React.SetStateAction<ErrorObject | undefined>
	>

	activeNetworkResource?: NetworkResource
	setActiveNetworkResource: React.Dispatch<
		React.SetStateAction<NetworkResource | undefined>
	>
}

export const [usePlayerUIContext, PlayerUIContextProvider] =
	createContext<PlayerUIContext>('PlayerUI')

/**
 * This is used if we need to render a higher surface while the player is in fullscreen.
 * This is meant to be used with `Popover`'s `getPopupContainer` prop.
 * Sets the Popover's mount node as the player center panel.
 * The default is document.body
 * We override here to be able to show the comments when the player is in fullscreen
 * Without this, the new comment modal would be below the fullscreen view.
 */
export const getFullScreenPopoverGetPopupContainer = () => {
	const playerCenterPanel = document.getElementById('playerCenterPanel')

	if (playerCenterPanel) {
		return playerCenterPanel
	}

	return document.body
}
