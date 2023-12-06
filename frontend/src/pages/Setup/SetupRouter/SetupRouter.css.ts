import { themeVars } from '@highlight-run/ui/theme'
import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const menuItem = style({
	borderRadius: 4,
	color: themeVars.interactive.fill.secondary.content.text,
	cursor: 'pointer',
	padding: '12px 8px',
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

export const menuItemSecondary = style([
	menuItem,
	{
		alignItems: 'center',
		display: 'flex',
		flexDirection: 'row',
		gap: 4,
		padding: 8,
	},
])

export const copyProjectIdIdButton = style({
	alignItems: 'center',
	border: vars.border.dividerWeak,
	borderRadius: 6,
	display: 'flex',
	height: 36,
	marginBottom: 6,
	justifyContent: 'space-between',
	padding: '0 8px',
	width: 325,
})

export const selectContainer = style({
	width: 240,
	color: `${vars.theme.static.content.default} !important`,
	selectors: {
		'&:hover': {
			background: vars.theme.interactive.overlay.secondary.hover,
		},
	},
})
