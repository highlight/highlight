import { vars } from '@highlight-run/ui'
import { globalStyle, style } from '@vanilla-extract/css'

export const searchIcon = style({
	position: 'absolute',
	top: 13,
	left: 14,
})

export const combobox = style({
	background: 'transparent',
	border: 0,
	color: vars.theme.static.content.default,
	display: 'flex',
	fontSize: 13,
	padding: '6px 0 6px 40px',
	width: '100%',
	selectors: {
		'&:focus': {
			outline: 0,
		},
	},
})

export const comboboxInput = globalStyle(`${combobox}::placeholder`, {
	color: vars.theme.interactive.fill.secondary.content.onDisabled,
})

export const comboboxPopover = style({
	background: vars.theme.static.surface.default,
	border: vars.border.dividerWeak,
	borderRadius: vars.borderRadius[8],
	boxShadow: vars.shadows.small,
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
