import { sprinkles } from '@highlight-run/ui/sprinkles'
import { themeVars } from '@highlight-run/ui/theme'
import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

import { styledVerticalScrollbar } from '@/style/common.css'

// Mirrors SettingsRouter.css.ts — same tokens, same sizing logic.

export const pageContainer = style({
	display: 'flex',
	height: '100%',
	overflow: 'hidden',
})

export const sidebar = style({
	width: 220,
	flexShrink: 0,
	borderRight: vars.border.secondary,
	display: 'flex',
	flexDirection: 'column',
	padding: '8px 0',
	gap: 4,
})

export const sidebarScroll = style([
	sprinkles({
		overflowY: 'auto',
		overflowX: 'hidden',
	}),
	styledVerticalScrollbar,
])

export const sidebarSection = style({
	paddingBottom: 8,
})

export const sidebarSectionTitle = style({
	padding: '4px 8px',
	fontSize: 11,
	fontWeight: 600,
	letterSpacing: '0.08em',
	color: themeVars.interactive.fill.secondary.content.text,
	marginBottom: 4,
})

export const sidebarItem = style({
	borderRadius: 4,
	color: themeVars.interactive.fill.secondary.content.text,
	cursor: 'pointer',
	padding: '6px 8px',
	margin: '1px 4px',
	display: 'flex',
	alignItems: 'center',
	gap: 8,
	textDecoration: 'none',
	selectors: {
		'&:hover': {
			backgroundColor: themeVars.interactive.overlay.secondary.hover,
			color: themeVars.interactive.fill.secondary.content.onEnabled,
		},
	},
})

export const sidebarItemActive = style({
	backgroundColor: themeVars.interactive.overlay.secondary.pressed,
	color: themeVars.interactive.fill.secondary.content.onEnabled,
})

export const sidebarItemLabel = style({
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	flex: 1,
	fontSize: 13,
})

export const integrationIcon = style({
	width: 16,
	height: 16,
	flexShrink: 0,
	objectFit: 'contain',
	borderRadius: 3,
})

export const detailIcon = style({
	width: 32,
	height: 32,
	flexShrink: 0,
	objectFit: 'contain',
	borderRadius: 6,
})

export const statusDot = style({
	width: 8,
	height: 8,
	borderRadius: '50%',
	flexShrink: 0,
})

export const statusDotEnabled = style({
	backgroundColor: themeVars.static.content.good,
})

export const detailPanel = style({
	flex: 1,
	overflowY: 'auto',
	padding: 24,
})

export const detailHeader = style({
	display: 'flex',
	alignItems: 'center',
	gap: 12,
	marginBottom: 16,
})

export const detailTitle = style({
	fontSize: 20,
	fontWeight: 600,
	margin: 0,
	color: themeVars.interactive.fill.secondary.content.onEnabled,
})
