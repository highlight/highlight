import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const linkStyle = style({
	textDecoration: 'none',
	color: vars.theme.interactive.fill.secondary.content.text,
	selectors: {
		'&:hover': {
			color: vars.theme.interactive.fill.secondary.content.text,
		},
	},
})
