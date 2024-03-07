import { style } from '@vanilla-extract/css'
import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

import { vars } from '../../css/vars'

export const button = style({
	background: 'transparent',
	border: 0,
	cursor: 'pointer',
	padding: 0,
})

export const variants = recipe({
	variants: {
		kind: {
			primary: {
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

			secondary: {
				color: vars.theme.interactive.fill.secondary.content.text,
				selectors: {
					'&:hover': {
						color: vars.theme.interactive.fill.secondary.content
							.onEnabled,
					},
					'&:active': {
						color: vars.theme.interactive.fill.secondary.content
							.onEnabled,
					},
				},
			},

			light: {
				color: vars.theme.interactive.fill.secondary.enabled,
				selectors: {
					'&:hover': {
						color: vars.theme.interactive.fill.secondary.content
							.onDisabled,
					},
					'&:active': {
						color: vars.theme.interactive.fill.secondary.content
							.onDisabled,
					},
				},
			},
		},
	},

	defaultVariants: {
		kind: 'primary',
	},
})

export type Variants = RecipeVariants<typeof variants>
