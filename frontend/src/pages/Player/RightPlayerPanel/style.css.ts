import { style } from '@vanilla-extract/css'

export const RIGHT_PANEL_WIDTH = 300

export const playerRightPanelContainer = style({
	position: 'relative',
	transform: 'translateX(0)',
	transition: 'transform 0.2s ease-in-out',
	zIndex: 5,
})

export const playerRightPanelContainerBannerShown = style({
	height: `calc(100vh - 108px - var(--banner-height))`,
})

export const playerRightPanelContainerHidden = style({
	position: 'fixed',
	transform: `translateX(-${RIGHT_PANEL_WIDTH}px)`,
})

export const tabContentContainer = style({
	height: '100%',
	padding: 0,
})

export const tabs = style({
	borderRadius: 8,
})
