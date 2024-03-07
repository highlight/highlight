import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

import { sprinkles } from '../../css/sprinkles.css'
import { vars } from '../../css/vars'

export const variants = recipe({
	base: {
		alignItems: 'center',
		boxSizing: 'content-box',
		display: 'inline-flex',
		userSelect: 'none',
		width: 'max-content',
	},

	variants: {
		size: {
			small: [sprinkles({ px: '3' }), { minHeight: 16 }],
			medium: [sprinkles({ px: '4' }), { minHeight: 20 }],
			large: [sprinkles({ px: '6' }), { minHeight: 24 }],
		},
		shape: {
			rounded: {},
			basic: {},
		},
		variant: {
			white: {
				background: vars.theme.static.surface.default,
				border: vars.border.secondary,
				color: vars.theme.static.content.moderate,
			},
			gray: {
				background: vars.theme.static.surface.sentiment.neutral,
				color: vars.theme.static.content.moderate,
			},
			outlineGray: {
				border: vars.border.secondary,
				color: vars.theme.static.content.moderate,
			},
			green: {
				background: vars.theme.static.surface.sentiment.good,
				color: vars.theme.static.content.sentiment.good,
			},
			blue: sprinkles({
				background: 'lb100',
			}),
			red: {
				background: vars.theme.static.surface.sentiment.bad,
				color: vars.theme.static.content.sentiment.bad,
			},
			yellow: {
				background: vars.theme.static.surface.sentiment.caution,
				color: vars.theme.static.content.sentiment.caution,
			},
			purple: {
				background: vars.theme.static.surface.sentiment.informative,
				color: vars.theme.static.content.sentiment.informative,
			},
			outlinePurple: {
				border: vars.border.primary,
				color: vars.theme.interactive.outline.primary.enabled,
			},
		},
	},

	compoundVariants: [
		{
			variants: {
				size: 'small',
				shape: 'basic',
			},
			style: {
				borderRadius: vars.borderRadius['3'],
			},
		},
		{
			variants: {
				size: 'medium',
				shape: 'basic',
			},
			style: {
				borderRadius: vars.borderRadius['5'],
			},
		},
		{
			variants: {
				size: 'large',
				shape: 'basic',
			},
			style: {
				borderRadius: vars.borderRadius['6'],
			},
		},

		{
			variants: {
				size: 'small',
				shape: 'rounded',
			},
			style: {
				borderRadius: vars.borderRadius['23'],
			},
		},
		{
			variants: {
				size: 'medium',
				shape: 'rounded',
			},
			style: {
				borderRadius: vars.borderRadius['10'],
			},
		},
		{
			variants: {
				size: 'large',
				shape: 'rounded',
			},
			style: {
				borderRadius: vars.borderRadius['16'],
			},
		},
	],

	defaultVariants: {
		size: 'small',
		shape: 'basic',
		variant: 'white',
	},
})

export type Variants = RecipeVariants<typeof variants>
