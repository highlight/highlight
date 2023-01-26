import { style } from '@vanilla-extract/css'

export const base = style({
	textDecoration: 'none',
	selectors: {
		// Restores default focus styles.
		'&:focus-visible': {
			outline: 'revert !important',
		},
	},
})
