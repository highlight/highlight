import { vars } from '@highlight-run/ui'
import { style } from '@vanilla-extract/css'

export const row = style({
	borderRadius: 6,
	padding: '6px 8px',
	selectors: {
		'&:hover': {
			backgroundColor: vars.theme.interactive.overlay.secondary.hover,
		},
		'&:active': {
			backgroundColor: vars.theme.interactive.overlay.secondary.pressed,
		},
	},
})

export const rowExpanded = style({
	background: vars.theme.interactive.overlay.secondary.pressed,
})
