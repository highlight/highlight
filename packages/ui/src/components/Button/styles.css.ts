import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { vars } from '../../css/vars'
import { typographyStyles } from '../Text/styles.css'

export const shadows = {
	grey: 'inset 0px -1px 0px rgba(0, 0, 0, 0.1)',
	primary: 'inset 0px -1px 0px rgba(0, 0, 0, 0.32)',
} as const

export const defaultSize = 'small'

export const iconVariants = recipe({
	base: {
		alignItems: 'center',
		display: 'inline-flex',
		justifyContent: 'center',
	},

	variants: {
		size: {
			xSmall: { height: 16, width: 16, ...typographyStyles.size.xSmall },
			small: { height: 16, width: 16, ...typographyStyles.size.small },
			medium: { height: 16, width: 16, ...typographyStyles.size.small },
			large: { height: 16, width: 16, ...typographyStyles.size.small },
			xLarge: { height: 16, width: 16, ...typographyStyles.size.large },
		},
	},

	defaultVariants: {
		size: defaultSize,
	},
})

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
		},
		{
			selectors: {
				'&:disabled, &:disabled:hover, &:disabled:focus': {
					backgroundColor: vars.color.neutral50,
					border: 0,
					boxShadow: 'none',
					color: vars.color.neutral300,
				},
				'&:focus, &:active': {
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
			primary: {
				background: vars.color.purple500,
				color: vars.color.white,
				boxShadow: shadows.primary,
				selectors: {
					'&:hover': {
						background: vars.color.purple700,
					},
					'&:focus, &:active': {
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
					'&:focus, &:active': {
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
					'&:focus, &:active': {
						boxShadow: 'none',
					},
				},
			},
		},
		size: {
			xSmall: [
				sprinkles({ borderRadius: '6', gap: '4', px: '6' }),
				{ height: 24 },
			],
			small: [
				sprinkles({ borderRadius: '6', gap: '4', px: '6' }),
				{ height: 28 },
			],
			medium: [
				sprinkles({ borderRadius: '6', gap: '6', px: '8' }),
				{ height: 32 },
			],
			large: [
				sprinkles({ borderRadius: '6', gap: '6', px: '10' }),
				{ height: 36 },
			],
			xLarge: [
				sprinkles({ borderRadius: '8', gap: '8', px: '12' }),
				{ height: 40 },
			],
		},
	},

	defaultVariants: {
		variant: 'primary',
		size: defaultSize,
	},
})

export type Variants = RecipeVariants<typeof variants>
