import { style } from '@vanilla-extract/css'

export const modal = style({
	position: `fixed`,
	zIndex: 1000,
	left: `50%`,
	top: `50%`,
	transform: `translate(-50%, -50%)`,
})
