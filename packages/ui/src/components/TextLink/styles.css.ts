import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { vars } from '../../css/vars'

export const variants = recipe({
	base: [
		// At some point we will want additional variants for links, but they aren't
		// finalized in our design system yet. These should probably become a
		// variant at that point.
		sprinkles({ color: 'purple700' }),
		{
			':hover': {
				color: vars.color.purple900,
			},
			':focus': {
				color: vars.color.purple900,
			},
			':active': {
				color: vars.color.purple700,
			},
		},
	],

	variants: {
		underline: {
			none: {
				textDecoration: 'none',
			},
			solid: {
				textDecoration: 'underline',
			},
		},
		color: {
			none: {
				color: vars.color.neutralN11,
				':hover': {
					color: vars.color.neutralN11,
				},
				':focus': {
					color: vars.color.neutralN11,
				},
				':active': {
					color: vars.color.neutralN11,
				},
			},
			default: {},
		},
	},

	defaultVariants: {
		underline: 'none',
	},
})

export type Variants = RecipeVariants<typeof variants>
