import { keyframes } from '@vanilla-extract/css'

export const pulseKeyframes = keyframes({
	'0%': { opacity: 1 },
	'50%': { opacity: 0.5 },
	'100%': { opacity: 1 },
})
