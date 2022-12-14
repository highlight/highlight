import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'

export const variants = recipe({
	variants: {
		kind: {
			error: sprinkles({
				backgroundColor: 'neutral50',
			}),
			info: sprinkles({
				backgroundColor: 'white',
			}),
			warning: sprinkles({
				backgroundColor: 'neutral50',
			}),
		},
		border: {
			true: sprinkles({
				border: 'neutral',
				borderRadius: '8',
			}),
			false: sprinkles({}),
		},
	},

	defaultVariants: {
		kind: 'info',
		border: true,
	},
})

export type Variants = RecipeVariants<typeof variants>
