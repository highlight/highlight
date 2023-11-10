import { vars } from '@highlight-run/ui'
import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

export const variants = recipe({
	base: {
		width: '100%',
		border: vars.border.secondary,
	},
	variants: {
		type: {
			rounded: {},
			square: {
				border: 0,
				borderRadius: 0,
			},
		},
	},
})

export type Variants = RecipeVariants<typeof variants>
