import { style } from '@vanilla-extract/css'

export const line = style({
	selectors: {
		'& &': {
			paddingLeft: 22,
		},
	},
})
