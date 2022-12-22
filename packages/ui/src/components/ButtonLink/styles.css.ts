import { style } from '@vanilla-extract/css'
import { vars } from '../../css/vars'

export const button = style({
	background: 'transparent',
	border: 0,
	padding: 0,
	color: vars.theme.interactive.fill.primary.enabled,
	selectors: {
		'&:hover': {
			color: vars.theme.interactive.fill.primary.hover,
		},
		'&:active': {
			color: vars.theme.interactive.fill.primary.pressed,
		},
	},
})
