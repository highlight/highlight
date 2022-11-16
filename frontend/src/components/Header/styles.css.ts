import { vars } from '@highlight-run/ui/src/css/vars'
import { style } from '@vanilla-extract/css'

export const linkStyle = style({
	textDecoration: 'none',
	color: vars.color.neutral800,
	selectors: {
		'&:hover': {
			color: vars.color.neutral800,
		},
	},
})
