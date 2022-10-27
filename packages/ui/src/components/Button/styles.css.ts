import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { vars } from '../../css/vars'
import { typographyStyles } from '../Text/styles.css'

const shadows = {
	grey: 'inset 0px -1px 0px rgba(0, 0, 0, 0.1)',
	primary: 'inset 0px -1px 0px rgba(0, 0, 0, 0.32)',
} as const

export const variants = recipe({
	base: [
		sprinkles({
			alignItems: 'center',
			border: 'none',
			display: 'inline-flex',
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
				boxShadow: shadows.primary,
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
				boxShadow: shadows.grey,
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
					borderRadius: '6',
					px: '6',
				}),
				{ height: 24 },
				typographyStyles.size.xSmall,
			],
			small: [
				sprinkles({
					borderRadius: '6',
					px: '6',
				}),
				{ height: 28 },
				typographyStyles.size.small,
			],
			medium: [
				sprinkles({
					borderRadius: '6',
					px: '8',
				}),
				{ height: 32 },
				typographyStyles.size.small,
			],
			large: [
				sprinkles({
					borderRadius: '6',
					px: '10',
				}),
				{ height: 36 },
				typographyStyles.size.small,
			],
			xLarge: [
				sprinkles({
					borderRadius: '8',
					px: '12',
				}),
				{ height: 40 },
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
