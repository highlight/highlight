import { style } from '@vanilla-extract/css'

import { sprinkles } from '@/sprinkles'
import { vars } from '@/vars'

import * as rowStyles from '../Row/styles.css'
import * as tableStyles from '../styles.css'

export const search = style([
	sprinkles({
		py: '6',
	}),
	{
		background: 'transparent',
		selectors: {
			// Borders
			[`${tableStyles.table}:not(${tableStyles.noBorder}) &`]: {
				border: rowStyles.BORDER,
				borderTopLeftRadius: 8,
				borderTopRightRadius: 8,
			},
		},
	},
])

export const combobox = style({
	fontSize: 13,
	border: 0,
	color: vars.theme.static.content.default,
	selectors: {
		'&:focus': {
			outline: 0,
		},
	},
})
