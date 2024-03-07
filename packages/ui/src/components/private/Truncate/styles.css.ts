import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

import { keepsLines } from '../../../utils/css'

export const variants = recipe({
	variants: {
		lines: {
			'1': keepsLines(1),
			'2': keepsLines(2),
			'3': keepsLines(3),
			'4': keepsLines(4),
		},
	},
})

export type Variants = RecipeVariants<typeof variants>
