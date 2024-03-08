import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const rowLink = style({
	borderRadius: vars.borderRadius[4],
	color: vars.theme.interactive.fill.secondary.content.text,
	display: 'block',
	selectors: {
		'&:hover': {
			backgroundColor: vars.theme.interactive.overlay.secondary.hover,
			color: vars.theme.interactive.fill.secondary.content.text,
		},
		'&:active': {
			backgroundColor: vars.theme.interactive.overlay.secondary.pressed,
			color: vars.theme.interactive.fill.secondary.content.text,
		},
	},
})
