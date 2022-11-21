import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'

export const variants = recipe({
	variants: {
		kind: {
			error: sprinkles({}),
			info: sprinkles({}),
			warning: sprinkles({}),
		},
	},

	defaultVariants: {
		kind: 'info',
	},
})

export type Variants = RecipeVariants<typeof variants>
