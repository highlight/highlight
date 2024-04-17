import { style } from '@vanilla-extract/css'

export const searchPanel = style({
	transition: 'transform 0.2s ease-in-out',
	height: 'calc(100vh - var(--header-height))',
})
export const searchPanelWithBanner = style({
	height: 'calc(100vh - var(--header-height) - var(--banner-height))',
})
