import { style } from '@vanilla-extract/css'

import { cell } from '../Cell/styles.css'
import { header } from '../Header/styles.css'
import { row } from '../Row/styles.css'

export const discoverable = style({
	display: 'flex',
	visibility: 'hidden',
})

export const rowTrigger = style({
	selectors: {
		[`${row}:hover &`]: {
			visibility: 'visible',
		},
	},
})

export const cellTrigger = style({
	selectors: {
		[`${cell}:hover &`]: {
			visibility: 'visible',
		},
	},
})

export const headerTrigger = style({
	selectors: {
		[`${header}:hover &`]: {
			visibility: 'visible',
		},
	},
})
