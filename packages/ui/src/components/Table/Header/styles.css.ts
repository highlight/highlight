import { style } from '@vanilla-extract/css'
import { vars } from '../../../css/vars'
import { row } from '../../../components/Table/Row/styles.css'

export const header = style({
	borderRight: '1px solid transparent',
	color: vars.theme.static.content.weak,
	lineHeight: '16px',
	padding: '10px 8px',
	selectors: {
		'&:hover': {
			color: vars.theme.interactive.fill.secondary.content.onEnabled,
		},

		[`${row}:hover &:not(:last-of-type)`]: {
			borderRight: `1px solid ${vars.theme.static.divider.weak}`,
		},
	},
})
