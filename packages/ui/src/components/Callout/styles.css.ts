import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'

export const variants = recipe({
	variants: {
		kind: {
			error: sprinkles({
				backgroundColor: 'n1',
			}),
			info: sprinkles({
				backgroundColor: 'white',
			}),
			warning: sprinkles({
				backgroundColor: 'n1',
			}),
		},
	},

	defaultVariants: {
		kind: 'info',
	},
})

export type Variants = RecipeVariants<typeof variants>
