import { recipe } from '@vanilla-extract/recipes'

export const sessionAttributeRow = recipe({
	base: {
		display: 'grid',
		gridTemplateColumns: `90px 1fr`,
		gridGap: 8,
		cursor: 'pointer',
		alignItems: 'center',
	},
	variants: {
		json: {
			false: {},
			true: { display: 'block' },
		},
	},
})
