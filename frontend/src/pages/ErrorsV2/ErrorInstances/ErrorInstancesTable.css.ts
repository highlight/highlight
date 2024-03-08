import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const rowLink = style({
	borderRadius: vars.borderRadius[4],
	color: vars.theme.interactive.fill.secondary.content.text,
	selectors: {
		'&:hover': {
			backgroundColor: vars.theme.interactive.overlay.secondary.hover,
		},
		'&:active': {
			backgroundColor: vars.theme.interactive.overlay.secondary.pressed,
		},
	},
})

export const rowLinkSelected = style({
	backgroundColor: vars.theme.interactive.overlay.secondary.selected.default,
	borderRadius: vars.borderRadius[4],
})
