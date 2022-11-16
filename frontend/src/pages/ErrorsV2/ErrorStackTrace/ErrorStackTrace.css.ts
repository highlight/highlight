import { vars } from '@highlight-run/ui/src/css/vars'
import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const collapsibleContent = recipe({
	base: {
		borderRight: vars.border.neutral,
		borderBottom: vars.border.neutral,
		borderLeft: vars.border.neutral,
		margin: 0,
	},

	variants: {
		rounded: {
			true: {
				borderBottomLeftRadius: vars.borderRadius[6],
				borderBottomRightRadius: vars.borderRadius[6],
			},
			false: {},
		},
	},
})

export const lineNumber = style({
	display: 'inline-block',
	textAlign: 'center',
	width: 46,
})

export const iconCaret = recipe({
	base: {
		height: 14,
		transition: 'transform 0.25s',
	},

	variants: {
		open: {
			true: { transform: 'rotate(-180deg)' },
			false: {},
		},
	},
})
