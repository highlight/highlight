import { style } from '@vanilla-extract/css'
import { vars } from '../../../css/vars'

export const cell = style({
	padding: 8,
	borderRadius: 6,
	selectors: {
		'&:hover': {
			background: vars.theme.interactive.overlay.secondary.hover,
		},

		'&:active': {
			background: vars.theme.interactive.overlay.secondary.pressed,
		},
	},
})
