import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { vars } from '../../css/vars'
import { typographyStyles } from '../Text/styles.css'

export const variants = recipe({
	base: [
		sprinkles({
			border: 'none',
			display: 'inline-block',
		}),
		{
			lineHeight: '1em',
			width: 'auto',
			...typographyStyles.family.body,
		},
		{
			selectors: {
				// TODO: Clean up duplication
				'&:disabled': {
					backgroundColor: vars.color.neutral50,
					border: 0,
					boxShadow: 'none',
					color: vars.color.neutral300,
				},
				'&:disabled:hover': {
					backgroundColor: vars.color.neutral50,
					border: 0,
					boxShadow: 'none',
					color: vars.color.neutral300,
				},
				'&:disabled:active': {
					backgroundColor: vars.color.neutral50,
					border: 0,
					boxShadow: 'none',
				},
			},
		},
	],

	variants: {
		variant: {
			primary: {
				background: vars.color.purple500,
				color: vars.color.white,
				// TODO: Variablize this value
				boxShadow: 'inset 0px -1px 0px rgba(0, 0, 0, 0.32)',
				selectors: {
					'&:hover': {
						background: vars.color.purple700,
					},
					'&:active': {
						boxShadow: 'none',
					},
				},
			},
			white: {
				background: vars.color.white,
				border: `1px solid ${vars.color.neutral200}`,
				color: vars.color.neutral800,
				selectors: {
					'&:hover': {
						background: vars.color.neutral50,
					},
					'&:active': {
						border: `1px solid ${vars.color.neutral300}`,
					},
				},
			},
			grey: {
				background: vars.color.neutral100,
				color: vars.color.neutral800,
				// TODO: Variablize this value
				boxShadow: 'inset 0px -1px 0px rgba(0, 0, 0, 0.1)',
				selectors: {
					'&:hover': {
						background: vars.color.neutral200,
					},
					'&:active': {
						boxShadow: 'none',
					},
				},
			},
		},
		size: {
			xSmall: [
				sprinkles({
					borderRadius: 'medium',
					padding: 'medium',
				}),
				typographyStyles.size.xSmall,
			],
			small: [
				sprinkles({
					borderRadius: 'medium',
					padding: 'medium',
				}),
				typographyStyles.size.small,
			],
			medium: [
				sprinkles({
					borderRadius: 'medium',
					padding: 'large',
				}),
				typographyStyles.size.small,
			],
			large: [
				sprinkles({
					borderRadius: 'medium',
					padding: 'large',
				}),
				typographyStyles.size.small,
			],
			xLarge: [
				sprinkles({
					borderRadius: 'large',
					padding: 'xLarge',
				}),
				typographyStyles.size.large,
			],
		},
	},

	defaultVariants: {
		variant: 'primary',
		size: 'small',
	},
})

export type Variants = RecipeVariants<typeof variants>
