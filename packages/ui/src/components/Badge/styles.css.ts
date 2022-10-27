import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { vars } from '../../css/vars'

export const variants = recipe({
	base: [
		{
			alignItems: 'center',
			display: 'inline-flex',
		},
	],

	variants: {
		size: {
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
			white: sprinkles({ background: 'white', border: 'neutral' }),
			grey: sprinkles({ background: 'neutral100' }),
			outlineGrey: sprinkles({
				border: 'neutral',
			}),
			green: sprinkles({
				background: 'green500',
			}),
		},
	},

	compoundVariants: [
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
