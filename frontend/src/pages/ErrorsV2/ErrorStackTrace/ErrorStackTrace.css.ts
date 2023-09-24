import { vars } from '@highlight-run/ui/src/css/vars'
import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const collapsibleContent = recipe({
	base: {
		borderRight: vars.border.secondary,
		borderBottom: vars.border.secondary,
		borderLeft: vars.border.secondary,
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

export const name = style({
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	paddingTop: 2,
	height: 16,
	maxWidth: 120,
})
export const file = style({
	maxWidth: 560,
})

export const fileName = style({
	maxWidth: 300,
	paddingBottom: 6,
	paddingRight: 6,
	paddingTop: 6,
})
