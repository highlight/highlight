import { keyframes, style } from '@vanilla-extract/css'

export const toastContainer = style({
	position: 'fixed',
	bottom: 0,
	right: 0,
	zIndex: 99999,
})

const fadeInAnimation = keyframes({
	'0%': { opacity: 0 },
	'100%': { opacity: 100 },
})

export const toastItem = style({
	animationIterationCount: 1,
	animationName: fadeInAnimation,
	animationDuration: '0.3s',
	position: 'fixed',
	bottom: '16px',
	right: '16px',
	width: '280px',
	zIndex: 99999,
})
