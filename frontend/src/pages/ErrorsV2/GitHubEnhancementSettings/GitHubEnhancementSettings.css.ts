import { vars } from '@highlight-run/ui/src/css/vars'
import { keyframes, style } from '@vanilla-extract/css'

export const container = style({
	background: vars.theme.static.surface.raised,
	borderRadius: 6,
	padding: '8px 4px',
})

export const cardStep = style({
	padding: 8,
})

const rotate = keyframes({
	'0%': {
		transform: 'rotate(0deg)',
	},
	'100%': {
		transform: 'rotate(360deg)',
	},
})

export const loading = style({
	animation: `1s ${rotate} linear infinite`,
})
