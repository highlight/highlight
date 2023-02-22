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
	border: vars.border.dividerWeak,
	borderRadius: vars.borderRadius[8],
	display: 'flex',
	flexDirection: 'column',
	flexGrow: 1,
	left: 6,
	right: 0,
	maxWidth: 600,
})

export const comboboxItem = style({
	padding: '12px 10px',
	selectors: {
		'&:hover': {
			backgroundColor: vars.theme.interactive.fill.secondary.hover,
		},
		'&[data-active-item]': {
			backgroundColor: vars.theme.interactive.fill.secondary.pressed,
		},
	},
})

export const comboboxGroup = style({
	selectors: {
		'& + &': {
			borderTop: vars.border.secondary,
		},
	},
})
