import { themeVars } from '@highlight-run/ui/src/css/theme.css'
import { style } from '@vanilla-extract/css'

export const menuItem = style({
	borderRadius: 4,
	color: themeVars.interactive.fill.secondary.content.text,
	padding: 14,
	width: 325,
	selectors: {
		'&:hover:not(&:disabled)': {
			backgroundColor: themeVars.interactive.overlay.secondary.pressed,
			color: themeVars.interactive.fill.secondary.content.onEnabled,
		},
		'&:disabled': {
			color: themeVars.interactive.fill.secondary.content.onDisabled,
		},
	},
})
