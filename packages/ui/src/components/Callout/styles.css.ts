import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { vars } from '../../css/vars'

export const variants = recipe({
	variants: {
		kind: {
			info: {},
			error: sprinkles({
				backgroundColor: vars.theme.static.surface.raised,
			}),
			warning: sprinkles({
				backgroundColor: vars.theme.static.surface.raised,
			}),
		},
	},

	defaultVariants: {
		kind: 'info',
	},
})

export type Variants = RecipeVariants<typeof variants>
