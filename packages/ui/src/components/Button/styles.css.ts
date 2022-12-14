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
		selectors: {
			'&[disabled]': {
				pointerEvents: 'none',
				userSelect: 'none',
			},
		},
	},

	variants: {
		size: {
			xSmall: { height: 12, width: 12, ...typographyStyles.size.xSmall },
			small: { height: 12, width: 12, ...typographyStyles.size.small },
			medium: { height: 14, width: 14, ...typographyStyles.size.small },
			large: { height: 16, width: 16, ...typographyStyles.size.small },
			xLarge: { height: 16, width: 16, ...typographyStyles.size.large },
		},
		emphasis: {
			high: {},
			medium: {},
			low: {},
		},
		kind: {
			primary: {},
			secondary: {},
		},
	},

	compoundVariants: [
		{
			variants: {
				kind: 'primary',
				emphasis: 'low',
			},
			style: {
				selectors: {
					'&:focus, &:active': {
						color: vars.color.purple500,
					},
				},
			},
		},
		{
			variants: {
				kind: 'secondary',
				emphasis: 'high',
			},
			style: {
				color: vars.color.neutral700,
				selectors: {
					'&[disabled]': {
						color: vars.color.neutral300,
					},
				},
			},
		},
		{
			variants: {
				kind: 'secondary',
				emphasis: 'medium',
			},
			style: {
				color: vars.color.neutral700,
				selectors: {
					'&[disabled]': {
						color: vars.color.neutral300,
					},
				},
			},
		},
		{
			variants: {
				kind: 'secondary',
				emphasis: 'low',
			},
			style: {
				color: vars.color.neutral500,
				selectors: {
					'&:hover': {
						color: vars.color.neutral700,
					},
					'&:focus, &:active': {
						color: vars.color.neutral500,
					},
					'&[disabled]': {
						color: vars.color.neutral300,
					},
				},
			},
		},
	],

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
			background: 'transparent',
			outline: 'none',
			selectors: {
				'&:hover': {
					cursor: 'pointer',
				},
				'&[disabled]': {
					pointerEvents: 'none',
					userSelect: 'none',
				},
			},
		},
	],

	variants: {
		emphasis: {
			high: {},
			medium: {},
			low: {},
		},
		kind: {
			primary: {},
			secondary: {},
		},
		size: {
			xSmall: [
				sprinkles({ borderRadius: '4', gap: '4', px: '6' }),
				{ height: 24 },
			],
			small: [
				sprinkles({ borderRadius: '6', gap: '6', px: '6' }),
				{ height: 28 },
			],
			medium: [
				sprinkles({ borderRadius: '6', gap: '6', px: '8' }),
				{ height: 32 },
			],
		},
	},
	compoundVariants: [
		{
			variants: {
				kind: 'primary',
				emphasis: 'high',
			},
			style: {
				background: vars.color.purple500,
				color: vars.color.white,
				boxShadow: shadows.primary,
				selectors: {
					'&:hover': {
						background: vars.color.purple700,
						color: vars.color.white,
					},
					'&:focus, &:active': {
						background: vars.color.purple700,
						color: vars.color.white,
						boxShadow: 'none',
					},
					'&[disabled], &[disabled]:hover, &[disabled]:focus': {
						background: vars.color.purple100,
						color: vars.color.neutral50,
						boxShadow: 'none',
					},
				},
			},
		},
		{
			variants: {
				kind: 'primary',
				emphasis: 'medium',
			},
			style: {
				color: vars.color.purple500,
				boxShadow: 'none',
				border: vars.border.neutral,
				selectors: {
					'&:hover': {
						border: vars.border.neutralDark,
						color: vars.color.purple700,
					},
					'&:focus, &:active': {
						border: vars.border.purple,
						color: vars.color.purple700,
					},
					'&[disabled], &[disabled]:hover, &[disabled]:focus': {
						border: vars.border.purpleLight,
						color: vars.color.purple100,
					},
				},
			},
		},
		{
			variants: {
				kind: 'primary',
				emphasis: 'low',
			},
			style: {
				color: vars.color.purple500,
				boxShadow: 'none',
				border: vars.border.none,
				selectors: {
					'&:hover': {
						color: vars.color.purple700,
						background: vars.color.neutral200,
					},
					'&:focus, &:active': {
						color: vars.color.purple700,
						background: vars.color.neutral200,
					},
					'&[disabled], &[disabled]:hover, &[disabled]:focus': {
						color: vars.color.purple100,
					},
				},
			},
		},
		{
			variants: {
				kind: 'secondary',
				emphasis: 'high',
			},
			style: {
				background: vars.color.neutral100,
				color: vars.color.neutral800,
				boxShadow: shadows.grey,
				selectors: {
					'&:hover': {
						background: vars.color.neutral200,
						color: vars.color.neutral800,
					},
					'&:focus, &:active': {
						background: vars.color.neutral200,
						color: vars.color.neutral800,
						boxShadow: 'none',
					},
					'&[disabled], &[disabled]:hover, &[disabled]:focus': {
						background: vars.color.neutral50,
						color: vars.color.neutral300,
						boxShadow: 'none',
					},
				},
			},
		},
		{
			variants: {
				kind: 'secondary',
				emphasis: 'medium',
			},
			style: {
				color: vars.color.neutral800,
				boxShadow: 'none',
				border: vars.border.neutral,
				selectors: {
					'&:hover': {
						border: vars.border.neutralDark,
						color: vars.color.neutral800,
					},
					'&:focus, &:active': {
						border: vars.border.neutralDark,
						background: vars.color.neutral100,
						color: vars.color.neutral800,
					},
					'&[disabled], &[disabled]:hover, &[disabled]:focus': {
						background: 'transparent',
						border: vars.border.neutral,
						color: vars.color.neutral300,
					},
				},
			},
		},
		{
			variants: {
				kind: 'secondary',
				emphasis: 'low',
			},
			style: {
				color: vars.color.neutral700,
				boxShadow: 'none',
				border: vars.border.none,
				selectors: {
					'&:hover': {
						background: vars.color.neutral200,
						color: vars.color.neutral800,
					},
					'&:focus, &:active': {
						background: vars.color.neutral200,
						color: vars.color.neutral800,
					},
					'&[disabled], &[disabled]:hover, &[disabled]:focus': {
						background: 'transparent',
						color: vars.color.neutral300,
					},
				},
			},
		},
	],
	defaultVariants: {
		kind: 'primary',
		emphasis: 'high',
		size: defaultSize,
	},
})

export type Variants = RecipeVariants<typeof variants>
