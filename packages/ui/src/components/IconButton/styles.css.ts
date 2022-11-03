import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { vars } from '../../css/vars'

export const variants = recipe({
	base: [
		{
			alignItems: 'center',
			display: 'inline-flex',
			justifyContent: 'center',
			height: 20,
			width: 20,
			boxShadow: 'none',
			border: 'none',
			padding: '0',
		},
		sprinkles({ borderRadius: '4' }),
		{
			selectors: {
				'&:hover, &:focus': {
					border: 0,
					boxShadow: 'none',
					outline: 'none',
				},
			},
		},
	],

	variants: {
		variant: {
			primary: {
				background: vars.color.purple500,
				color: vars.color.white,
				selectors: {
					'&:hover': {
						background: vars.color.purple700,
						color: vars.color.neutral50,
					},
					'&:focus': {
						background: vars.color.purple500,
						color: vars.color.white,
					},
				},
			},
			secondary: {
				background: vars.color.white,
				color: vars.color.neutral500,
				selectors: {
					'&:hover': {
						background: vars.color.neutral200,
						color: vars.color.neutral700,
					},
					'&:focus': {
						background: vars.color.neutral50,
						color: vars.color.neutral500,
					},
				},
			},
		},
	},

	defaultVariants: {
		variant: 'primary',
	},
})

export type Variants = RecipeVariants<typeof variants>
