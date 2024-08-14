import { style } from '@vanilla-extract/css'

export const lastName = style({
	borderTop: 0,
	selectors: {
		'&:focus, &:hover': {
			borderTop: `0 !important`,
		},
	},
})
