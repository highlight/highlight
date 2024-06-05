import { keyframes, style } from '@vanilla-extract/css'

export const toastContainer = style({
	position: 'fixed',
	bottom: 0,
	right: 0,
	zIndex: 100,
})

const fadeInAnimation = keyframes({
	'0%': { opacity: 0 },
	'100%': { opacity: 100 },
})

export const toastItem = style({
	animationIterationCount: 1,
	animationName: fadeInAnimation,
	animationDuration: '0.3s',
	width: '280px',
})
