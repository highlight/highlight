import { colors } from '@highlight-run/ui/src/css/colors'
import { SESSION_FEED_SCROLLBAR } from '@pages/Sessions/SessionsFeedV3/SessionFeedV3.css'
import { style } from '@vanilla-extract/css'

export const playerRightPanelContainer = style({
	background: colors.white,
	borderTop: `1px solid ${colors.n6}`,
	borderLeft: `1px solid ${colors.n6}`,
	boxSizing: 'content-box',
	flexShrink: 0,
	position: 'relative',
	right: 0,
	top: 0,
	transition: `transform 0.2s ease-in-out`,
	height: `calc(100vh - 108px)`,
	width: 'var(--right-panel-width)',
	selectors: SESSION_FEED_SCROLLBAR,
	zIndex: 5,
})

export const playerRightPanelContainerBannerShown = style({
	height: `calc(100vh - 108px - var(--banner-height))`,
})

export const playerRightPanelContainerHidden = style({
	position: 'fixed',
	top: 96,
	transform: `translateX(calc(var(--right-panel-width) + var(--size-medium)))`,
})

export const playerRightPanelCollapsible = style({
	boxSizing: 'content-box',
	display: 'grid',
	gridTemplateRows: `auto 1fr`,
	height: `calc(100vh - 108px)`,
	overflowX: 'hidden',
	overflowY: 'hidden',
})

export const playerRightPanelCollapsibleBannerShown = style({
	height: `calc(100vh - 108px - var(--banner-height))`,
})

export const tabContentContainer = style({
	height: '100%',
	padding: 0,
})

export const tabs = style({
	borderRadius: 8,
})

export const playerRightTabs = style({})
