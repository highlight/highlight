import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'

export const variants = recipe({
	variants: {
		kind: {
			error: sprinkles({
				backgroundColor: 'neutral100',
			}),
			info: sprinkles({
				backgroundColor: 'white',
			}),
			warning: sprinkles({
				backgroundColor: 'neutral100',
			}),
		},
	},

	defaultVariants: {
		kind: 'info',
	},
})

export type Variants = RecipeVariants<typeof variants>
