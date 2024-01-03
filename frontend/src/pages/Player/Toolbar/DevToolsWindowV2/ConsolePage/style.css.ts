import { colors } from '@highlight-run/ui/colors'
import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const consoleBox = style({
	paddingLeft: 8,
	height: '100%',
})

export const consoleRow = style({
	selectors: {
		'&:focus, &:active, &:hover': {
			backgroundColor: colors.n5,
		},
	},
})

export const messageRowVariants = recipe({
	variants: {
		current: {
			true: {
				backgroundColor: colors.n4,
			},
			false: {},
		},
	},
})
