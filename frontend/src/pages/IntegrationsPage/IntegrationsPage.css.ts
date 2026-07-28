import { sprinkles } from '@highlight-run/ui/sprinkles'
import { themeVars } from '@highlight-run/ui/theme'
import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

import { styledVerticalScrollbar } from '@/style/common.css'

export const menuTitle = style({
	height: 12,
})

export const menuItem = style({
	borderRadius: 4,
	color: themeVars.interactive.fill.secondary.content.text,
	cursor: 'pointer',
	padding: '8px 8px',
	width: 220,
	height: 28,
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

export const menuItemActive = style({
	backgroundColor: themeVars.interactive.overlay.secondary.pressed,
	color: themeVars.interactive.fill.secondary.content.onEnabled,
})

export const sidebarScroll = style([
	sprinkles({
		overflowY: 'auto',
		overflowX: 'hidden',
	}),
	styledVerticalScrollbar,
	{
		selectors: {
			'& + &': {
				borderTop: vars.border.secondary,
			},
		},
	},
])

export const integrationIcon = style({
	width: 16,
	height: 16,
	borderRadius: '50%',
	objectFit: 'cover',
	flexShrink: 0,
})

export const integrationIconSquare = style({
	borderRadius: 0,
})

export const statusDot = style({
	width: 6,
	height: 6,
	borderRadius: '50%',
	backgroundColor: themeVars.interactive.fill.primary.enabled,
	flexShrink: 0,
	marginLeft: 'auto',
})

export const detailHeader = style({
	display: 'flex',
	alignItems: 'center',
	gap: 12,
})

export const detailIcon = style({
	width: 32,
	height: 32,
	borderRadius: '50%',
	objectFit: 'cover',
	flexShrink: 0,
})

export const detailIconSquare = style({
	borderRadius: 0,
})
