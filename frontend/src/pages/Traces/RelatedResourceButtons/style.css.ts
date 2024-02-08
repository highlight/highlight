import { style } from '@vanilla-extract/css'

export const tagButton = style({
	selectors: {
		[`&:first-of-type`]: {
			borderRight: 'none',
		},
		[`&:last-of-type`]: {
			borderLeft: 'none',
		},
	},
})
