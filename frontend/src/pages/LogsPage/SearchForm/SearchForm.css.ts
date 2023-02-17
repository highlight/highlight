import { vars } from '@highlight-run/ui'
import { style } from '@vanilla-extract/css'

export const container = style({})

export const combobox = style({
	borderRadius: vars.borderRadius[6],
	border: vars.border.secondary,
	color: vars.theme.static.content.default,
	fontSize: 13,
	padding: '4px 6px',
	width: '100%',
})

export const comboboxPopover = style({
	background: vars.theme.static.surface.default,
	border: vars.border.secondary,
	borderRadius: vars.borderRadius[8],
	display: 'flex',
	flexDirection: 'column',
	flexGrow: 1,
	padding: '4px 0',
	left: 0,
	right: 0,
})

export const comboboxItem = style({
	fontSize: 13,
	padding: '3px 12px',
	selectors: {
		'&:hover': {
			backgroundColor: vars.theme.interactive.fill.secondary.hover,
		},
		'&[data-active-item]': {
			backgroundColor: vars.theme.interactive.fill.secondary.pressed,
		},
	},
})
