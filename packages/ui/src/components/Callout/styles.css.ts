import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
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
	},

	defaultVariants: {
		kind: 'info',
	},
})

export type Variants = RecipeVariants<typeof variants>
