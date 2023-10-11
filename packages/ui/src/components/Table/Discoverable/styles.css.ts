import { style } from '@vanilla-extract/css'

import { cell } from '../Cell/styles.css'

export const discoverable = style({
	display: 'none',

	selectors: {
		[`${cell}:hover &`]: {
			display: 'flex',
		},
	},
})
