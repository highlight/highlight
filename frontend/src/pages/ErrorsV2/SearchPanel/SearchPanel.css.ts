import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'

export const ERROR_FEED_LEFT_PANEL_WIDTH = 340

export const searchPanel = style({
	transition: 'transform 0.2s ease-in-out',
	width: ERROR_FEED_LEFT_PANEL_WIDTH,
	position: 'fixed',
	height: 'calc(100vh - var(--header-height))',
})
export const searchPanelWithBanner = style({
	height: 'calc(100vh - var(--header-height) - var(--banner-height))',
})
export const searchPanelHidden = style({
	position: 'fixed',
	transform: `translateX(-${ERROR_FEED_LEFT_PANEL_WIDTH}px)`,
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

export const ERROR_FEED_SCROLLBAR_WIDTH = 8
export const SEARCH_PANEL_CONTROL_BAR_HEIGHT = 44
export const content = style({
	height: '100%',
	selectors: {
		'&::-webkit-scrollbar': {
			backgroundColor: colors.n2,
			width: ERROR_FEED_SCROLLBAR_WIDTH,
		},
		'&::-webkit-scrollbar-thumb': {
			backgroundColor: colors.n4,
		},
	},
})

export const controlBar = style({
	height: SEARCH_PANEL_CONTROL_BAR_HEIGHT,
	flexShrink: 0,
	position: 'sticky',
	top: 0,
	zIndex: 10,
})
