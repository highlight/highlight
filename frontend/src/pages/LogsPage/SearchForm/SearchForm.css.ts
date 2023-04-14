import { vars } from '@highlight-run/ui'
import { sprinkles } from '@highlight-run/ui/src/css/sprinkles.css'
import { globalStyle, style } from '@vanilla-extract/css'

import { styledVerticalScrollbar } from '@/style/common.css'

export const searchIcon = style({
	position: 'absolute',
	top: 13,
	left: 14,
})

export const combobox = style([
	sprinkles({
		py: '6',
	}),
	{
		background: 'transparent',
		border: 0,
		color: vars.theme.static.content.default,
		display: 'flex',
		fontSize: 13,
		width: '100%',
		selectors: {
			'&:focus': {
				outline: 0,
			},
		},
	},
])

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
	maxWidth: 600,
	maxHeight: 'min(var(--popover-available-height,300px),300px)',
	zIndex: 1,
})

export const comboboxItem = style({
	cursor: 'pointer',
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

export const comboboxGroup = style([
	sprinkles({
		overflowY: 'scroll',
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
