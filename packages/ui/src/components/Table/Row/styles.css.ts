import { style } from '@vanilla-extract/css'
import { vars } from '../../../css/vars'

const BORDER = `1px solid ${vars.theme.static.divider.weak}`

export const row = style({
	display: 'grid',
	borderBottom: BORDER,
	borderLeft: BORDER,
	borderRight: BORDER,
	width: '100%',

	':first-of-type': {
		borderTop: BORDER,
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
	},

	':last-of-type': {
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
	},

	selectors: {
		'&:hover': {
			background: vars.theme.static.surface.sentiment.neutral,
			cursor: 'pointer',
		},
	},
})

export const header = style({
	selectors: {
		'&:hover': {
			background: 'none',
			cursor: 'unset',
		},
	},
})
