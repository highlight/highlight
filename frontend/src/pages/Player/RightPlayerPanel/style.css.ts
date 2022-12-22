import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'

export const playerRightPanelContainer = style({
	background: colors.white,
	borderLeft: `1px solid ${colors.n6}`,
	boxSizing: 'content-box',
	flexShrink: 0,
	position: 'relative',
	right: 0,
	top: 0,
	transition: `transform 0.2s ease-in-out`,
	width: 'var(--right-panel-width)',
})

export const playerRightPanelContainerHidden = style({
	position: 'fixed',
	transform: `translateX(calc(var(--right-panel-width) + var(--size-medium)))`,
})

export const playerRightPanelCollapsible = style({
	boxSizing: 'content-box',
	display: 'grid',
	gridTemplateRows: `auto 1fr`,
	height: `calc(100vh - var(--header-height) - var(--size-medium) - var(--size-medium))`,
	overflowX: 'hidden',
	overflowY: 'auto',
})

export const playerRightPanelCollapsibleBannerShown = style({
	height: `calc(100vh - var(--header-height) - var(--size-medium) - var(--size-medium) - var(--banner-height))`,
})

export const tabContentContainer = style({
	height: '100%',
	padding: 0,
})

export const tabs = style({
	borderRadius: 8,
})
