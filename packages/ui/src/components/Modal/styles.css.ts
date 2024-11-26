import { style } from '@vanilla-extract/css'

export const modal = style({
	position: `fixed`,
	zIndex: 1000,
	left: `50%`,
	top: `40px`,
	transform: `translate(-50%, 0)`,
})
