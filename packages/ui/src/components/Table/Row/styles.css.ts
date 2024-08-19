import { style } from '@vanilla-extract/css'

import { vars } from '../../../css/vars'
import * as headStyles from '../Head/styles.css'
import * as tableStyles from '../styles.css'

export const row = style({
	boxSizing: 'border-box',
	borderBottom: tableStyles.BORDER,
	display: 'grid',
	width: '100%',

	selectors: {
		'&:hover': {
			background: vars.theme.static.surface.raised,
		},
		'&:last-of-type': {
			borderBottom: 0,
		},
		[`${headStyles.head} &`]: {
			background: 'none',
		},
	},
})

export const selected = style({
	background: vars.theme.static.surface.raised,
})
