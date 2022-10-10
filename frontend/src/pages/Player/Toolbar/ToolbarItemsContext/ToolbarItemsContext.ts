import { createContext } from '@util/context/context'

export interface ToolbarItem {
	/**
	 * Whether this `ToolbarItem` is pinned to the toolbar.
	 * A pinned item is shown on the toolbar. Unpinned items are shown in the menu.
	 */
	isPinned: boolean
}

type ToolbarItemSetter = (newValue: ToolbarItem) => void
export interface ZoomAreaPercent {
	left: number
	right: number
}

interface ToolbarItemsContext {
	devToolsButton: ToolbarItem
	setDevToolsButton: ToolbarItemSetter
	timelineAnnotations: ToolbarItem
	setTimelineAnnotations: ToolbarItemSetter
	playbackSpeedControl: ToolbarItem
	setPlaybackSpeedControl: ToolbarItemSetter
	showMouseTrail: ToolbarItem
	setShowMouseTrail: ToolbarItemSetter
	skipInactive: ToolbarItem
	setSkipInactive: ToolbarItemSetter
	autoPlay: ToolbarItem
	setAutoPlay: ToolbarItemSetter
	showPlayerTime: ToolbarItem
	setShowPlayerTime: ToolbarItemSetter
	zoomAreaPercent: ZoomAreaPercent
	setZoomAreaPercent: React.Dispatch<React.SetStateAction<ZoomAreaPercent>>
}

export const [useToolbarItemsContext, ToolbarItemsContextProvider] =
	createContext<ToolbarItemsContext>('ToolbarItemsContext')
