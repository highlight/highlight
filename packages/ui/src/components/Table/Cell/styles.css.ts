import { style } from '@vanilla-extract/css'

import { vars } from '../../../css/vars'

export const cell = style({
	selectors: {
		'&:hover': {
			background: vars.theme.interactive.overlay.secondary.hover,
		},

		'&:active': {
			background: vars.theme.interactive.overlay.secondary.pressed,
		},
	},
})
