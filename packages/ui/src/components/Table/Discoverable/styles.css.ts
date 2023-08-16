import { style } from '@vanilla-extract/css'

import * as rowStyles from '../Row/styles.css'

export const discoverable = style({
	visibility: 'hidden',

	selectors: {
		[`${rowStyles.row}:hover &`]: {
			visibility: 'visible',
		},
	},
})
