import { style } from '@vanilla-extract/css'

const CONTAINER_WIDTH_WITH_PADDING = 980

export const containerContentStyles = style({
	// Using @media as a fallback if a browser doesn't support @container
	'@media': {
		[`(min-width: 1200px)`]: {
			width: CONTAINER_WIDTH_WITH_PADDING,
		},
	},

	// Conditionally applies width based on size of container.
	'@container': {
		[`(min-width: ${CONTAINER_WIDTH_WITH_PADDING}px)`]: {
			width: CONTAINER_WIDTH_WITH_PADDING,
		},
		[`(max-width: ${CONTAINER_WIDTH_WITH_PADDING - 1}px)`]: {
			width: 'auto',
		},
	},
})
