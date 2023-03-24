import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'
import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

export const container = style({
	//
})

export const variants = recipe({
	variants: {
		active: {},
		selected: {
			true: { backgroundColor: colors.lb700 },
			false: { backgroundColor: colors.red500 },
		},
	},

	defaultVariants: {
		selected: false,
	},
})

export type Variants = RecipeVariants<typeof variants>
