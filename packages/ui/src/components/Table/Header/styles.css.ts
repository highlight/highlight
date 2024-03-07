import { style } from '@vanilla-extract/css'

import { row } from '../../../components/Table/Row/styles.css'
import { vars } from '../../../css/vars'

export const header = style({
	alignItems: 'center',
	borderRight: '1px solid transparent',
	color: vars.theme.static.content.weak,
	display: 'grid',
	lineHeight: '16px',
	padding: '10px 8px',
	position: 'relative',
	selectors: {
		'&:hover': {
			color: vars.theme.interactive.fill.secondary.content.onEnabled,
		},

		[`${row}:hover &:not(:last-of-type)`]: {
			borderRight: `1px solid ${vars.theme.static.divider.weak}`,
		},
	},
})

export const noPadding = style({
	padding: 0,
})
