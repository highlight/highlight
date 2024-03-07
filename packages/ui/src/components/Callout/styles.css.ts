import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

import { sprinkles } from '../../css/sprinkles.css'
import { vars } from '../../css/vars'

export const variants = recipe({
	variants: {
		kind: {
			info: {
				background: 'transparent',
			},
			error: {
				backgroundColor: vars.theme.static.surface.raised,
			},
			warning: {
				backgroundColor: vars.theme.static.surface.raised,
			},
		},
		border: {
			true: sprinkles({
				border: 'secondary',
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
