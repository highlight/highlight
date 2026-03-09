import { sprinkles } from '@highlight-run/ui/sprinkles'
import { themeVars } from '@highlight-run/ui/theme'
import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

import { styledVerticalScrollbar } from '@/style/common.css'

export const menuTitle = style({
	height: 12,
})

export const menuItem = style({
	alignItems: 'center',
	borderRadius: 4,
	color: themeVars.interactive.fill.secondary.content.text,
	cursor: 'pointer',
	display: 'flex',
	gap: 8,
	height: 28,
	padding: '8px 8px',
	textDecoration: 'none',
	width: 250,
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
	borderRadius: '50%',
	height: 16,
	width: 16,
	flexShrink: 0,
})

export const integrationIconLarge = style({
	borderRadius: '50%',
	height: 24,
	width: 24,
	flexShrink: 0,
})

