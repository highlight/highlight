import { style } from '@vanilla-extract/css'
import { vars } from '@highlight-run/ui/vars'

export const categoryHeaderHover = style({
	':hover': {
		backgroundColor: vars.color.n1,
	},
})

export const optionRowHover = style({
	':hover': {
		backgroundColor: vars.color.n1,
	},
})

export const customCheckbox = style({
	width: '16px',
	height: '16px',
	marginRight: '8px',
	cursor: 'pointer',
})
