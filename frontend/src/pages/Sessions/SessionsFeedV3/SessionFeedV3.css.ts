import { style } from '@vanilla-extract/css'

export const SESSION_FEED_LEFT_PANEL_WIDTH = 340

export const searchPanel = style({
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
