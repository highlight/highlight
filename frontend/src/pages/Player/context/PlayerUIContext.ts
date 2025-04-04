import { HighlightEvent } from '@pages/Player/HighlightEvent'
import { createContext } from '@util/context/context'
import React from 'react'

export enum RightPanelView {
	Comments = 'COMMENTS',
	Session = 'SESSION',
	Event = 'EVENT',
}

export enum RightPlayerTab {
	Events = 'Events',
	Metadata = 'Metadata',
	AIInsights = 'AI Insights',
}

interface PlayerUIContext {
	isPlayerFullscreen: boolean
	setIsPlayerFullscreen: React.Dispatch<React.SetStateAction<boolean>>
	playerCenterPanelRef: React.RefObject<HTMLDivElement | null>
	/** Used to show detailed information. */
	selectedRightPanelTab: RightPlayerTab
	setSelectedRightPanelTab: (newValue: RightPlayerTab) => void

	activeEvent?: HighlightEvent
	setActiveEvent: React.Dispatch<
		React.SetStateAction<HighlightEvent | undefined>
	>

	activeEventIndex?: number
	setActiveEventIndex: React.Dispatch<React.SetStateAction<number>>

	searchItem?: string
	setSearchItem: React.Dispatch<React.SetStateAction<string | undefined>>

	rightPanelView: RightPanelView
	setRightPanelView: (newValue: RightPanelView) => void
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
