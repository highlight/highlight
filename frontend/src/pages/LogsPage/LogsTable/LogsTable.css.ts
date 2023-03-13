import { vars } from '@highlight-run/ui'
import { style } from '@vanilla-extract/css'

export const row = style({
	borderRadius: 6,
	padding: '8px 8px 8px 28px',
	position: 'relative',
	selectors: {
		'&:hover': {
			backgroundColor: vars.theme.interactive.overlay.secondary.hover,
		},
	},
})

export const rowExpanded = style({
	background: vars.theme.interactive.overlay.secondary.pressed,
})

export const expandIcon = style({
	left: 8,
	opacity: 0,
	position: 'absolute',
	top: 5,
	selectors: {
		[`${row}:hover &`]: {
			opacity: 1,
		},
		[`${rowExpanded} &`]: {
			opacity: 1,
		},
	},
})
