import { vars } from '@highlight-run/ui/src'
import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const sessionAttributeRow = recipe({
	base: {
		display: 'grid',
		gridTemplateColumns: `100px 168px`,
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

export const secondaryText = style({
	color: vars.theme.interactive.fill.secondary.content.text,
	wordBreak: 'break-all',
})
