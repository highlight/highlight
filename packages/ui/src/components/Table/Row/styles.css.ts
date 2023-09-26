import { style } from '@vanilla-extract/css'
import { vars } from '../../../css/vars'
import * as headStyles from '../Head/styles.css'
import * as bodyStyles from '../Body/styles.css'
import * as tableStyles from '../styles.css'

export const BORDER = `1px solid ${vars.theme.static.divider.weak}`

export const row = style({
	borderBottom: BORDER,
	display: 'grid',
	width: '100%',

	selectors: {
		'&:hover': {
			background: vars.theme.static.surface.sentiment.neutral,
		},

		// Borders
		[`${tableStyles.table}:not(${tableStyles.noBorder}) &`]: {
			borderLeft: BORDER,
			borderRight: BORDER,
		},
		[`${tableStyles.noBorder} ${bodyStyles.body} &:last-of-type`]: {
			borderBottom: 0,
		},

		[`${headStyles.head} &`]: {
			background: 'none',
		},
		[`${tableStyles.table}:not(${tableStyles.noBorder}) ${headStyles.head} &:first-of-type`]:
			{
				borderTop: BORDER,
				borderTopLeftRadius: 8,
				borderTopRightRadius: 8,
			},
		[`${tableStyles.table}:not(${tableStyles.noBorder}) ${bodyStyles.body} &:last-of-type`]:
			{
				borderBottomLeftRadius: 8,
				borderBottomRightRadius: 8,
			},
	},
})
