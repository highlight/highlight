import { keyframes, style } from '@vanilla-extract/css'

export const toastContainer = style({
	position: 'fixed',
	bottom: 32,
	right: 32,
	zIndex: 999999,
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
	zIndex: 999999,
})
