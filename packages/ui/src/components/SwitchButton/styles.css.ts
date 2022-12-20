import { recipe, RecipeVariants } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { vars } from '../../css/vars'
import { shadows } from '../Button/styles.css'

export const defaultSize = 'small'

export const variants = recipe({
	base: [
		{
			alignItems: 'center',
			display: 'inline-flex',
			justifyContent: 'center',
			height: 28,
			width: 26,
			boxShadow: 'none',
			border: 'none',
			padding: '0',
		},
		sprinkles({ borderRadius: '6' }),
		{
			selectors: {
				'&:focus': {
					border: 0,
					boxShadow: 'none',
					outline: 'none',
				},
				'&:hover': {
					cursor: 'pointer',
				},
			},
		},
	],

	variants: {
		variant: {
			checked: {
				background: vars.color.purple500,
				color: vars.color.white,
				boxShadow: shadows.primary,
				selectors: {
					'&:hover': {
						background: vars.color.purple700,
					},
					'&:focus': {
						background: vars.color.purple700,
					},
					'&:disabled': {
						color: vars.color.purple100,
					},
				},
			},
			unchecked: {
				background: vars.color.neutral100,
				color: vars.color.neutral700,
				boxShadow: shadows.grey,
				selectors: {
					'&:hover': {
						background: vars.color.neutral200,
						color: vars.color.neutral700,
					},
					'&:focus': {
						background: vars.color.neutral200,
						color: vars.color.neutral700,
					},
					'&:disabled': {
						background: vars.color.white,
						color: vars.color.neutral300,
					},
				},
			},
		},
	},

	defaultVariants: {
		variant: 'unchecked',
	},
})

export type Variants = RecipeVariants<typeof variants>
