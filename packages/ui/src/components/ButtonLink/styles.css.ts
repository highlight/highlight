import { style } from '@vanilla-extract/css'
import { vars } from '../../css/vars'

export const button = style({
	background: 'transparent',
	border: 0,
	padding: 0,
	color: vars.color.purple500,
	selectors: {
		'&:hover, &:focus': {
			color: vars.color.purple900,
		},
		'&:active': {
			color: vars.color.purple700,
		},
	},
})
