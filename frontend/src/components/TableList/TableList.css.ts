import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const sessionAttributeRow = recipe({
	base: {
		display: 'grid',
		gridTemplateColumns: `90px 1fr`,
		gridGap: 8,
		cursor: 'pointer',
		alignItems: 'flex-start',
	},
	variants: {
		json: {
			false: {},
			true: { display: 'block' },
		},
	},
})

export const keyDisplayValue = style({
	padding: '6px',
})
