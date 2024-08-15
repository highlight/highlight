import { style } from '@vanilla-extract/css'

import { sprinkles } from '@/sprinkles'
import { vars } from '@/vars'

import * as tableStyles from '../styles.css'

export const search = style([
	sprinkles({
		py: '6',
	}),
	{
		background: 'transparent',
		borderBottom: tableStyles.BORDER,
	},
])

export const combobox = style({
	border: 0,
	color: vars.theme.static.content.default,
	flexGrow: 1,
	fontSize: 13,

	selectors: {
		'&:focus': {
			outline: 0,
		},
	},
})
