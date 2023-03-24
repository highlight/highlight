import { keyframes, style } from '@vanilla-extract/css'

export const container = style({
	position: 'sticky',
	top: 0,
	zIndex: 10,
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

export const badgeFirst = style({
	borderTopRightRadius: 0,
	borderBottomRightRadius: 0,
})

export const badgeLast = style({
	borderTopLeftRadius: 0,
	borderBottomLeftRadius: 0,
})
