import { style } from '@vanilla-extract/css'
import { vars } from '../../../css/vars'
import * as headStyles from '../Head/styles.css'
import * as bodyStyles from '../Body/styles.css'

const BORDER = `1px solid ${vars.theme.static.divider.weak}`

export const row = style({
	display: 'grid',
	borderBottom: BORDER,
	borderLeft: BORDER,
	borderRight: BORDER,
	width: '100%',

	selectors: {
		'&:hover': {
			background: vars.theme.static.surface.sentiment.neutral,
		},
		[`${headStyles.head} &`]: {
			background: 'none',
		},
		[`${headStyles.head} &:first-of-type`]: {
			borderTop: BORDER,
			borderTopLeftRadius: 8,
			borderTopRightRadius: 8,
		},
		[`${bodyStyles.body} &:last-of-type`]: {
			borderBottomLeftRadius: 8,
			borderBottomRightRadius: 8,
		},
	},
})
