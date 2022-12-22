import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { vars } from '../../css/vars'

export const variants = recipe({
	base: [
		{
			alignItems: 'center',
			display: 'inline-flex',
			userSelect: 'none',
		},
	],

	variants: {
		size: {
			tiny: [sprinkles({ px: '4' }), { height: 16 }],
			small: [sprinkles({ px: '6' }), { height: 16 }],
			medium: [sprinkles({ px: '8' }), { height: 20 }],
			large: [sprinkles({ px: '10' }), { height: 24 }],
		},
		shape: {
			round: {
				borderRadius: vars.borderRadius.round,
			},
			rounded: {},
		},
		variant: {
			white: {
				background: vars.theme.static.surface.default,
				border: vars.border.secondary,
				color: vars.theme.static.content.moderate,
			},
			grey: {
				background: vars.theme.static.surface.sentiment.neutral,
				color: vars.theme.static.content.moderate,
			},
			outlineGrey: {
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
			gray: sprinkles({
				background: vars.theme.static.content.weak,
			}),
			red: sprinkles({
				background: vars.theme.static.surface.sentiment.bad,
				color: vars.theme.static.content.sentiment.bad,
			}),
			yellow: sprinkles({
				background: vars.theme.static.surface.sentiment.caution,
				color: vars.theme.static.content.sentiment.caution,
			}),
			purple: sprinkles({
				background: vars.theme.static.surface.sentiment.informative,
				color: vars.theme.static.content.sentiment.informative,
			}),
		},
	},

	compoundVariants: [
		{
			variants: {
				size: 'tiny',
				shape: 'rounded',
			},
			style: {
				borderRadius: vars.borderRadius['3'],
			},
		},
		{
			variants: {
				size: 'small',
				shape: 'rounded',
			},
			style: {
				borderRadius: vars.borderRadius['3'],
			},
		},
		{
			variants: {
				size: 'medium',
				shape: 'rounded',
			},
			style: {
				borderRadius: vars.borderRadius['5'],
			},
		},
		{
			variants: {
				size: 'large',
				shape: 'rounded',
			},
			style: {
				borderRadius: vars.borderRadius['6'],
			},
		},
	],

	defaultVariants: {
		size: 'small',
		shape: 'rounded',
		variant: 'white',
	},
})

export type Variants = RecipeVariants<typeof variants>
