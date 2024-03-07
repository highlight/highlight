import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

import { vars } from '../../css/vars'

export const variants = recipe({
	base: [
		{
			// At some point we will want additional variants for links, but they aren't
			// finalized in our design system yet. These should probably become a
			// variant at that point.
			color: vars.theme.interactive.fill.primary.enabled,
			selectors: {
				'&:hover': {
					color: vars.theme.interactive.fill.primary.hover,
				},
				'&:active': {
					color: vars.theme.interactive.fill.primary.pressed,
				},
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
				color: vars.color.n11,
				':hover': {
					color: vars.color.n11,
				},
				':focus': {
					color: vars.color.n11,
				},
				':active': {
					color: vars.color.n11,
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
