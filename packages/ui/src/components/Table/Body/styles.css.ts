import { keyframes, style } from '@vanilla-extract/css'

// need for row styling
export const body = style({})

const rotate = keyframes({
	'0%': {
		transform: 'rotate(0deg)',
	},
	'100%': {
		transform: 'rotate(360deg)',
	},
})

export const loadingIcon = style({
	animation: `1s ${rotate} linear infinite`,
})
