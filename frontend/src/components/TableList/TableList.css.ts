import { vars } from '@highlight-run/ui/src'
import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const sessionAttributeRow = recipe({
	base: {
		display: 'grid',
		gridTemplateColumns: `100px 168px`,
		gridGap: 8,
		cursor: 'pointer',
	},
	variants: {
		json: {
			false: {},
			true: { display: 'block' },
		},
	},
})

export const sessionAttributeText = style({
	display: 'flex',
	alignItems: 'center',
	color: vars.theme.static.content.weak,
})

export const secondaryText = style({
	color: vars.theme.interactive.fill.secondary.content.text,
	wordBreak: 'break-all',
})
