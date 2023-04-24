import { themeVars } from '@highlight-run/ui/src/css/theme.css'
import { style } from '@vanilla-extract/css'

export const menuItem = style({
	borderRadius: 4,
	color: themeVars.interactive.fill.secondary.content.text,
	cursor: 'pointer',
	padding: '8px 8px',
	width: 325,
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
