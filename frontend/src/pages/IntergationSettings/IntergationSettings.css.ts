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
	width: 325,
	height: 28,
	display: 'flex',
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

export const menuItemDisabled = style({
	backgroundColor: themeVars.interactive.overlay.secondary.disabled,
	color: themeVars.interactive.fill.secondary.content.onDisabled,
	cursor: 'not-allowed',
	selectors: {
		'&:hover': {
			backgroundColor: themeVars.interactive.overlay.secondary.disabled,
			color: themeVars.interactive.fill.secondary.content.onDisabled,
		},
	},
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
