import { vars } from '@highlight-run/ui/src'
import { style } from '@vanilla-extract/css'

export const line = style({
	selectors: {
		'& &': {
			paddingLeft: 22,
		},
	},
})

export const linkButton = style({
	background: vars.theme.interactive.overlay.secondary.pressed,
	selectors: {
		'&:hover': {
			backgroundColor: vars.theme.interactive.overlay.secondary.hover,
		},
		'&:active': {
			backgroundColor: vars.theme.interactive.overlay.secondary.pressed,
		},
	},
})
