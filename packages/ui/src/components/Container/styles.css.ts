import { createContainer, style } from '@vanilla-extract/css'

import { breakpoints } from '../../css/breakpoints'

export const CONTAINER_MAX_WIDTH = 940
export const CONTAINER_WIDTH_WITH_PADDING = 980

const containerName = createContainer()

export const container = style({
	containerName,
	containerType: 'normal',
	overflowY: 'scroll',
	width: '100%',
	height: '100%',
})

export const content = style({
	// Using @media as a fallback if a browser doesn't support @container
	'@media': {
		[`(min-width: ${breakpoints.wide})`]: {
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
