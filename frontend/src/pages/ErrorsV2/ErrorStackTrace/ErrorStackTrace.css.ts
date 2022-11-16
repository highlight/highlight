import { vars } from '@highlight-run/ui/src/css/vars'
import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const collapsibleContent = style({
	borderRight: vars.border.neutral,
	borderBottom: vars.border.neutral,
	borderLeft: vars.border.neutral,
	margin: 0,
})

export const iconCaret = recipe({
	base: {
		height: 14,
		transition: 'transform 0.25s',
		transform: 'rotate(0deg)',
	},

	variants: {
		open: {
			true: { transform: 'rotate(-180deg)' },
			false: {},
		},
	},
})
