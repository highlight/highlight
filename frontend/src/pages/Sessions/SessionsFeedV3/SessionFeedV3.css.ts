import { themeVars } from '@highlight-run/ui/src/css/theme.css'
import { style } from '@vanilla-extract/css'

export const SESSION_FEED_LEFT_PANEL_WIDTH = 340

export const searchPanel = style({
	transition: 'transform 0.2s ease-in-out',
	width: SESSION_FEED_LEFT_PANEL_WIDTH,
	position: 'fixed',
	height: 'calc(100vh - var(--header-height))',
})
export const searchPanelWithBanner = style({
	height: 'calc(100vh - var(--header-height) - var(--banner-height))',
})
export const searchPanelHidden = style({
	position: 'fixed',
	transform: `translateX(-${SESSION_FEED_LEFT_PANEL_WIDTH}px)`,
})

export const searchPanelToggleButton = style({
	position: 'absolute',
	right: 'calc((-1 * var(--size-xLarge) / 2))',
	top: 16,
	transform: 'translateY(calc(112px + var(--size-medium) + 30px))',
	zIndex: 20,
})

export const searchPanelToggleButtonHidden = style({
	right: 'calc(-1 * (var(--sidebar-width) - var(--size-xLarge)))',
})

export const SESSION_FEED_SCROLLBAR_WIDTH = 6
export const SESSION_FEED_SCROLLBAR = {
	'&::-webkit-scrollbar': {
		backgroundColor: themeVars.interactive.outline.secondary.enabled,
		width: SESSION_FEED_SCROLLBAR_WIDTH,
	},
	'&::-webkit-scrollbar-thumb': {
		backgroundColor: themeVars.interactive.outline.secondary.hover,
	},
}
export const SEARCH_PANEL_CONTROL_BAR_HEIGHT = 44
export const content = style({
	height: '100%',
	selectors: SESSION_FEED_SCROLLBAR,
})

export const controlBar = style({
	height: SEARCH_PANEL_CONTROL_BAR_HEIGHT,
	flexShrink: 0,
	position: 'sticky',
	top: 0,
	zIndex: 10,
})
